# Agentic session state

This directory contains an optional machine-readable handoff for the Agent
Manager.

- `.agentic/session.json` is local and ignored by Git.
- `.agentic/last-context.md` is local and ignored by Git.
- The repository constitution and current specs are tracked and remain the
  durable source of truth.
- Never place credentials or provider secrets in session state.
