import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { buildCliInvocation, redactPreview } from './lib/cli'
import './App.css'

const commands = [
  'generate', 'stream', 'decide', 'transcribe', 'batch', 'loop',
  'auth', 'setup', 'status', 'get-best-provider', 'models', 'config',
  'memory', 'mcp', 'ollama', 'sagemaker', 'server', 'serve', 'proxy',
  'rag', 'workflow', 'observability', 'telemetry', 'docs', 'validate',
  'evaluate', 'task', 'autoresearch', 'agent', 'network', 'skills',
]

function App() {
  const [command, setCommand] = useState('generate')
  const [argumentText, setArgumentText] = useState('"Hello from NeuroLink GUI"')
  const [cwd, setCwd] = useState('')
  const [distro, setDistro] = useState('')
  const [help, setHelp] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState('Ready')
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    invoke<string>('discover_cli', {
      request: { executable: null, args: [], cwd: cwd || null, distro: distro || null },
    })
      .then(setHelp)
      .catch((error) => setStatus(String(error)))
  }, [cwd, distro])

  const run = async () => {
    setOutput('')
    setStatus('Running')
    const invocation = buildCliInvocation(command, argumentText, cwd || undefined, distro || undefined)
    try {
      const id = await invoke<string>('run_cli', {
        request: {
          executable: null,
          args: [invocation.command, ...invocation.args],
          cwd: invocation.cwd || null,
          distro: invocation.distro || null,
        },
      })
      setSessionId(id)
      await listen<{ stream: 'stdout' | 'stderr'; text: string }>(
        `neurolink-output-${id}`,
        (event) => setOutput((current) => `${current}${event.payload.text}\n`),
      )
      await listen<number | null>(`neurolink-finished-${id}`, (event) => {
        setStatus(event.payload === null ? 'Cancelled' : `Finished (exit ${event.payload})`)
        setSessionId(null)
      })
    } catch (error) {
      setStatus('Failed')
      setOutput(redactPreview(String(error)))
    }
  }

  const cancel = async () => {
    if (!sessionId) return
    await invoke('cancel_cli', { sessionId })
  }

  const loadHelp = async () => {
    setStatus('Loading command help')
    try {
      const text = await invoke<string>('discover_cli', {
        request: {
          executable: null,
          args: [command],
          cwd: cwd || null,
          distro: distro || null,
        },
      })
      setHelp(text)
      setStatus('Help loaded')
    } catch (error) {
      setStatus('Failed')
      setHelp(redactPreview(String(error)))
    }
  }

  return (
    <main className="app-shell">
      <aside>
        <div className="brand">
          <span className="brand-mark">N</span>
          <div><strong>NeuroLink</strong><small>Desktop</small></div>
        </div>
        <label htmlFor="command">Command</label>
        <select id="command" value={command} onChange={(event) => setCommand(event.target.value)}>
          {commands.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button type="button" className="secondary" onClick={loadHelp}>View CLI help</button>
        <label htmlFor="distro">WSL distribution</label>
        <input id="distro" value={distro} onChange={(event) => setDistro(event.target.value)} placeholder="Windows native (leave empty)" />
        <label htmlFor="cwd">Working directory</label>
        <input id="cwd" value={cwd} onChange={(event) => setCwd(event.target.value)} placeholder="Optional" />
      </aside>

      <section className="workspace">
        <header>
          <div><span className="eyebrow">Command</span><h1>{command}</h1></div>
          <span className={`status ${status === 'Running' ? 'running' : ''}`}>{status}</span>
        </header>

        <div className="composer">
          <label htmlFor="arguments">Arguments and options</label>
          <textarea
            id="arguments"
            value={argumentText}
            onChange={(event) => setArgumentText(event.target.value)}
            spellCheck={false}
            placeholder='Example: "Write a release note" --provider openai --format json'
          />
          <div className="actions">
            <button type="button" onClick={run} disabled={status === 'Running'}>Run</button>
            <button type="button" className="danger" onClick={cancel} disabled={!sessionId}>Cancel</button>
          </div>
        </div>

        <div className="panels">
          <section>
            <h2>Output</h2>
            <pre>{output || 'No output yet.'}</pre>
          </section>
          <section>
            <h2>CLI help</h2>
            <pre>{help || 'Command help is loading.'}</pre>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
