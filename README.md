# NeuroLink GUI

A lightweight cross-platform desktop GUI for the
[Juspay NeuroLink CLI](https://github.com/juspay/neurolink).

## Supported platforms

- Windows desktop
- Linux desktop
- Windows WSL with optional WSL distribution selection
- WSL/Linux desktop via WSLg

## Runtime

NeuroLink must be installed or available through `npx` in the target runtime.
For a global CLI:

```bash
npm install -g @juspay/neurolink
```

Set `NEUROLINK_EXECUTABLE` to a custom executable path when needed.

## Development

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm tauri dev
```

Run checks:

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm build
```

The Rust process runner is under `src-tauri/src/lib.rs`. The GUI passes
arguments as a process array and never evaluates command text in a shell.
