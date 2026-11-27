# NeuroLink GUI Project Constitution

**Status:** Ratified
**Version:** 1.0.0
**Scope:** Always applicable to every contributor, reviewer, agent, tool,
script, specification, implementation, test, release, and commit.

## 1. Constitutional authority

1. This constitution is the highest repository-level authority after explicit
   user authorization.
2. [AGENTS.md](../../AGENTS.md) is the operational adapter for coding agents.
   It must link to this constitution and reproduce no conflicting rule.
3. Specifications, plans, tasks, prompts, hooks, agents, and code derive from
   this constitution. A local convention that contradicts it is invalid.
4. Ambiguity must be resolved in favor of user safety, least surprise,
   reproducibility, and reversible change.

## 2. Goal hierarchy

The agent manager must evaluate work against goals in this order:

1. **G0 Reproducible resume:** a stopped or interrupted session is resumable
   from repository state and an explicit handoff record.
2. **G1 User safety:** no secret exposure, destructive behavior, shell
   interpolation, privilege escalation, or cross-platform data loss.
3. **G2 Correct behavior:** acceptance criteria and regression tests pass.
4. **G3 Architectural integrity:** domain boundaries, types, ownership, and
   public contracts remain coherent.
5. **G4 Delivery quality:** security, accessibility, packaging, observability,
   documentation, and release evidence are complete.
6. **G5 Delivery speed:** optimize only after G0-G4 remain satisfied.

Goals must be translated into SMART acceptance checks:

- **Specific:** one observable behavior or artifact.
- **Measurable:** a test, command, size, threshold, or review criterion.
- **Achievable:** scoped to one bounded task.
- **Relevant:** tied to a named requirement or risk.
- **Time-bounded:** completed before the next handoff or release gate.

## 3. Engineering principles

### KISS

- Prefer the smallest complete design that satisfies the acceptance
  criterion.
- Prefer explicit data flow, typed boundaries, and standard platform APIs over
  abstraction.

### DRY

- Reuse behavior after at least three coherent examples or a proven shared
  invariant. Do not create abstractions for a one-off case.
- Generated files, command catalogs, schemas, and release metadata must have
  one source of truth.

### YAGNI

- Do not implement speculative provider support, plugin systems, deployment
  targets, configuration layers, or update mechanisms before an acceptance
  criterion requires them.
- Defaults must be the smallest safe useful behavior.

### SOLID

- One responsibility per module.
- Depend on narrow interfaces.
- New behavior should not require modifying unrelated stable types.
- Subclasses or implementations must preserve substitutability.
- The UI, CLI process runner, platform discovery, and persistence are
  separate dependencies.

## 4. Agentic delivery framework

The canonical agent is the Agent Manager. It may delegate, but it remains
responsible for the delivered outcome.

### Required roles

1. **Manager:** loads this constitution and repository context, decomposes work,
   tracks dependencies, assigns bounded tasks, and creates handoffs.
2. **Specifier:** produces or updates the requirement/specification and
   acceptance criteria; never decides implementation details.
3. **Planner:** maps requirements to architecture and dependency-ordered tasks.
4. **Implementer:** makes the smallest complete code change.
5. **Tester:** writes and runs focused tests before claiming completion.
6. **Reviewer:** performs a read-only correctness, security, and tenant-boundary
   review and reports only actionable findings.
7. **Release:** validates changelog, semantic version, packages, signatures,
   and branch policy.

Agents must use MCP tools and repository tools only for bounded tasks.
Agents must not bypass permissions, read unneeded secrets, or silently infer
missing requirements.

### Mandatory workflow

`constitution -> specify -> clarify -> plan -> tasks -> implement -> test ->
review -> converge -> handoff`

The manager must stop and ask for user decision only when:

- requirements or scope are ambiguous;
- an irreversible action is required;
- authentication, signing, deletion, or external publication is involved;
- the user must choose an architectural tradeoff between two valid approaches.

### Resume protocol

Every session or delegated task must leave:

1. a git handoff with branch, changed files, current phase, completed work,
   blocked work, verification commands, and next actions;
2. a machine-readable state file in `.agentic/session.json`;
3. no secrets, credentials, provider keys, or personal data in tracked output.

The Agent Manager can be restored by running `pnpm agent:resume`. It must read
this constitution, `AGENTS.md`, the active handoff, branch state, spec tasks,
and verification state before proposing work.

## 5. Domain-driven development

The first bounded contexts are:

- `desktop-shell`: window, navigation, layout, accessibility;
- `cli-runtime`: executable discovery and process lifecycle;
- `command-catalog`: discovery and typed rendering of NeuroLink commands;
- `wsl-platform`: Windows/WSL/Linux path and runtime behavior;
- `packaging`: native bundles and release metadata;
- `release`: semantic versions, changelog, signing, and publication.

Business rules live behind domain names or modules, not in generic UI helpers.
Cross-context communication uses typed commands and events. No context may
reach into another context's private state.

## 6. Branch and collaboration policy

The public integration branch is `main`.

Allowed branch classes:

- `feature/<domain>/<username>/<topic>`
- `bugfix/<domain>/<username>/<topic>`
- `refactor/<domain>/<username>/<topic>`
- `docs/<domain>/<username>/<topic>`
- `hotfix/<domain>/<topic>`
- `release/vMAJOR.MINOR`
- `support/vMAJOR.MINOR`

Rules:

- Never commit directly to `main`.
- One topic, one branch.
- Rebase or merge only according to repository CI; force-push is forbidden on
  shared branches.
- A branch must contain the domain and the owner.
- Worktrees for separate users and domains must be independently resumable.
- `create_branch` tooling must derive owner from GitHub or Git configuration,
  sanitize it, and reject reserved or ambiguous names.

Create a branch with:

```bash
pnpm branch:new feature cli-runtime alice fix-stream-cancel
```

## 7. Semantic Versioning

The package version follows SemVer 2.0.0:

- MAJOR: incompatible public behavior or configuration;
- MINOR: backward-compatible feature;
- PATCH: backward-compatible defect correction.

Tauri and package versions must agree for a release. Pre-release branches use
`vMAJOR.MINOR.PATCH[-tag.N]` only after that exact tag is declared in
`CHANGELOG.md`.

## 8. Keep a Changelog

`CHANGELOG.md` follows Keep a Changelog:

- newest release first;
- `Unreleased` exists in every branch;
- entries use `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and
  `Security`;
- do not add a release entry without source-checked verification;
- breaking changes require MAJOR rationale and migration instructions.

## 9. Pre-commit constitution

Every branch is protected by a common hook plus branch-aware policy:

- all branches: staged secret scan, block private-key patterns, validate
  changed-file boundaries, and reject direct commits to `main`;
- `feature/*`, `bugfix/*`, `refactor/*`, `docs/*`: focused tests/lint,
  relevant domain checks, and generated-file consistency;
- `release/*`: full tests, lint, frontend build, Rust tests, version agreement,
  changelog validation, and package verification;
- `hotfix/*`: full tests plus security and changelog validation;
- `support/*`: reproducible build checks and security scan.

The branch policy must get progressively stricter toward `main`. It must never
weaken checks for convenience. Hooks must be visible, locally runnable, and
documented.
