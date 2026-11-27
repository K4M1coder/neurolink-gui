# NeuroLink GUI product specification

## Platform

The application is a native Tauri desktop client for Windows and Linux desktop.
On Windows it may execute NeuroLink natively or inside a selected WSL
distribution. In WSL/Linux desktop mode it executes NeuroLink directly.

## Command contract

The CLI installed for the target runtime is authoritative. The GUI discovers
top-level help and command-specific help dynamically and never assumes that an
undocumented flag is safe or accepted.

The raw arguments field may express any positional or option supported by the
selected NeuroLink command. Arguments are passed as an array to the process
runner; they are never joined into and evaluated as a shell command.

## Process behavior

- stdout and stderr are captured independently and streamed to the output view.
- API keys, access tokens, passwords, and likely token-shaped values are
  redacted before events reach the UI or logs.
- cancellation terminates the selected child process.
- working directory and WSL distribution are optional explicit inputs.
- process failures retain useful diagnostics and a stable exit status.

## Acceptance

1. A missing NeuroLink runtime produces a clear setup error.
2. Top-level help and command-specific help are visible after discovery.
3. Prompts containing spaces survive argument construction unchanged.
4. Repeatable file/image options remain separate arguments.
5. A running process can be cancelled.
6. Secret-shaped output is redacted.
7. Native Windows and Linux paths are never shell-interpolated.
