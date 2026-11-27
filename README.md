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

## Repository governance

This repository is governed by
[.specify/memory/constitution.md](.specify/memory/constitution.md). Coding
agents must also follow [AGENTS.md](AGENTS.md).

Resume work with:

```bash
pnpm agent:resume
```

Create a domain-owned branch with:

```bash
pnpm branch:new feature cli-runtime alice fix-stream-cancel
```

Install local hooks:

```bash
corepack pnpm prepare
python -m pre_commit install
```

The hook policy is progressively stricter for release and hotfix branches.
