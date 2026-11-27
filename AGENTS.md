# Agent instructions

This repository is governed by
[.specify/memory/constitution.md](.specify/memory/constitution.md).
The constitution is always applicable and has authority over this adapter,
repository prompts, plans, tasks, and generated agent output.

## Mandatory startup

Before editing or delegating, run:

```bash
pnpm agent:resume
```

Read in this order:

1. `.specify/memory/constitution.md`
2. `AGENTS.md`
3. active handoff in `.agentic/session.json`
4. `specs/`
5. `CHANGELOG.md`
6. git branch/status and changed files

Never assume that an absent session file means the task has no prior context.
Ask for a handoff only when the repository and git state do not establish the
goal and next action.

## Agent Manager

Use the Agent Manager role for multi-step work. It owns the outcome and may
delegate bounded tasks only to the repository roles in the constitution.
The manager must maintain:

- active goal and acceptance criteria;
- domain and owner;
- dependency-ordered task list;
- completed and blocked work;
- test evidence;
- unresolved decisions;
- exact next action.

Canonical handoff file: `.agentic/session.json`

Handoff rules:

- never track secrets or provider credentials;
- update after every phase that changes requirements or code;
- include exact verification commands and results;
- mark stale or superseded decisions;
- leave resumable work, not a narrative-only summary.

## Spec Kit workflow

Use:

1. `constitution` for durable rules;
2. `spec.md` for user-visible behavior;
3. `plan.md` for technical decisions;
4. `tasks.md` for dependency-ordered implementation;
5. `checklist.md` for acceptance evidence.

Do not implement before acceptance criteria and test cases exist.
Do not mark a task complete without an observable verification command.

## Branch workflow

Create work with:

```bash
pnpm branch:new feature cli-runtime alice fix-stream-cancel
```

Direct commits to `main` are prohibited. Domain and owner are mandatory in
feature, bugfix, refactor, and docs branches.

## Validation

For normal work, run:

```bash
pnpm test
pnpm lint
pnpm build
cargo test --manifest-path src-tauri/Cargo.toml
```

For release branches, also run:

```bash
pnpm tauri build --debug
pnpm release:check
```
