use regex::Regex;
use serde::Deserialize;
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::{Emitter, State};

struct ProcessState {
    children: Arc<Mutex<HashMap<String, Child>>>,
}

#[derive(Deserialize)]
struct RunRequest {
    executable: Option<String>,
    args: Vec<String>,
    cwd: Option<String>,
    distro: Option<String>,
}

fn redact(text: &str) -> String {
    let patterns = [
        (Regex::new(r"(?i)(api[_-]?key|access[_-]?token|password|secret)\s*[=:]\s*[^\s,;]+").unwrap(), "$1=[REDACTED]"),
        (Regex::new(r"\b(sk-[A-Za-z0-9_-]{8,}|AIza[A-Za-z0-9_-]{12,})\b").unwrap(), "[REDACTED]"),
    ];
    let mut output = text.to_string();
    for (pattern, replacement) in patterns {
        output = pattern.replace_all(&output, replacement).to_string();
    }
    output
}

fn build_command(request: &RunRequest) -> (String, Command) {
    let mut command = if let Some(executable) = &request.executable {
        Command::new(executable)
    } else if cfg!(windows) {
        Command::new("neurolink.cmd")
    } else {
        Command::new("neurolink")
    };

    if let Some(distro) = &request.distro {
        let mut wsl = Command::new("wsl.exe");
        wsl.arg("-d").arg(distro).arg("--").arg("neurolink");
        for arg in &request.args {
            wsl.arg(arg);
        }
        return ("wsl.exe".to_string(), wsl);
    }

    for arg in &request.args {
        command.arg(arg);
    }
    if let Some(cwd) = &request.cwd {
        command.current_dir(cwd);
    }
    (command.get_program().to_string_lossy().into_owned(), command)
}

#[tauri::command]
fn discover_cli(request: RunRequest) -> Result<String, String> {
    let executable = request
        .executable
        .clone()
        .unwrap_or_else(|| {
            if cfg!(windows) {
                "neurolink.cmd".to_string()
            } else {
                "neurolink".to_string()
            }
        });
    let mut args = request.args;
    if args.is_empty() {
        args.push("--help".to_string());
    } else if args.last().map(String::as_str) != Some("--help") {
        args.push("--help".to_string());
    }
    let mut command = if let Some(distro) = &request.distro {
        let mut wsl = Command::new("wsl.exe");
        wsl.arg("-d").arg(distro).arg("--").arg("neurolink");
        wsl.args(args);
        wsl
    } else {
        let mut native = Command::new(executable.clone());
        if let Some(cwd) = &request.cwd {
            native.current_dir(cwd);
        }
        native.args(args);
        native
    };
    command.stdout(Stdio::piped()).stderr(Stdio::piped());
    let output = command.output().map_err(|error| {
        format!("Unable to start NeuroLink executable '{}': {error}", executable)
    })?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    if output.status.success() {
        Ok(redact(&stdout))
    } else {
        Err(redact(&format!(
            "{}{}",
            stdout,
            if stderr.is_empty() { "" } else { &stderr }
        )))
    }
}

#[tauri::command]
fn run_cli(app: tauri::AppHandle, state: State<'_, ProcessState>, request: RunRequest) -> Result<String, String> {
    let session_id = uuid::Uuid::new_v4().to_string();
    let (_, mut command) = build_command(&request);
    command
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = command.spawn().map_err(|error| {
        format!("Unable to start NeuroLink: {error}")
    })?;
    let stdout = child.stdout.take();
    let stderr = child.stderr.take();
    state.children.lock().unwrap().insert(session_id.clone(), child);

    let event_name = format!("neurolink-output-{session_id}");
    let finished_name = format!("neurolink-finished-{session_id}");
    let children = state.children.clone();
    let id = session_id.clone();
    std::thread::spawn(move || {
        if let Some(stdout) = stdout {
            let reader = BufReader::new(stdout);
            for line in reader.lines().map_while(Result::ok) {
                let _ = app.emit(&event_name, serde_json::json!({"stream":"stdout","text":redact(&line)}));
            }
        }
        if let Some(stderr) = stderr {
            let reader = BufReader::new(stderr);
            for line in reader.lines().map_while(Result::ok) {
                let _ = app.emit(&event_name, serde_json::json!({"stream":"stderr","text":redact(&line)}));
            }
        }
        let status = children
            .lock()
            .unwrap()
            .get_mut(&id)
            .and_then(|child| child.wait().ok());
        children.lock().unwrap().remove(&id);
        let _ = app.emit(&finished_name, status.map(|value| value.code()).unwrap_or(None));
    });

    Ok(session_id)
}

#[tauri::command]
fn cancel_cli(state: State<'_, ProcessState>, session_id: String) -> Result<bool, String> {
    let mut children = state.children.lock().map_err(|_| "Process state unavailable")?;
    if let Some(child) = children.get_mut(&session_id) {
        child.kill().map_err(|error| format!("Unable to cancel process: {error}"))?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ProcessState {
            children: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![discover_cli, run_cli, cancel_cli])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}

#[cfg(test)]
mod tests {
    use super::redact;

    #[test]
    fn redacts_assignments_and_token_shapes() {
        let input = "OPENAI_API_KEY=sk-abcdefghijklmnop --password secret";
        let result = redact(input);
        assert!(!result.contains("sk-abcdefghijklmnop"));
        assert!(result.contains("[REDACTED]"));
    }
}
