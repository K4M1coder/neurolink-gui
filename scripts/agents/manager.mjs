import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const action = process.argv.slice(2)[0] || 'resume'

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', cwd: root }).trim()
  } catch {
    return ''
  }
}

const branch = git(['symbolic-ref', '--short', 'HEAD']) || 'detached'
const status = git(['status', '--porcelain=v1'])
const statePath = resolve(root, '.agentic/session.json')
let state = {}

if (existsSync(statePath)) {
  state = JSON.parse(readFileSync(statePath, 'utf8'))
}

if (action === 'handoff') {
  const summary = process.argv.slice(3).join(' ').trim()
  state = {
    version: 1,
    branch,
    goal: state.goal || 'No active goal recorded',
    phase: state.phase || 'handoff',
    completed: state.completed || [],
    blocked: state.blocked || [],
    next_actions: state.next_actions || [],
    handoff_summary: summary,
    changed_files: status.split('\n').filter(Boolean),
    updated_at: new Date().toISOString(),
  }
} else {
  state = {
    version: 1,
    branch,
    goal: state.goal || 'Resume repository work',
    phase: state.phase || 'resume',
    completed: state.completed || [],
    blocked: state.blocked || [],
    next_actions: state.next_actions || [],
    handoff_summary: state.handoff_summary || '',
    changed_files: status.split('\n').filter(Boolean),
    updated_at: new Date().toISOString(),
  }
}

mkdirSync(resolve(root, '.agentic'), { recursive: true })
writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`)

const context = [
  '# Agent resume context',
  '',
  `- Branch: ${branch}`,
  `- Goal: ${state.goal}`,
  `- Phase: ${state.phase}`,
  `- Constitution: .specify/memory/constitution.md`,
  `- Agent rules: AGENTS.md`,
  `- Handoff summary: ${state.handoff_summary || 'none'}`,
  `- Changed files: ${state.changed_files.length || 'none'}`,
  `- Completed: ${state.completed.length || 'none'}`,
  `- Blocked: ${state.blocked.length || 'none'}`,
  `- Next actions: ${state.next_actions.length || 'none'}`,
  '',
  'Before implementation:',
  '1. Read the constitution and AGENTS.md.',
  '2. Read active specs and acceptance criteria.',
  '3. Decompose work and update this handoff after each phase.',
  '4. Run focused tests before broad checks.',
]
writeFileSync(resolve(root, '.agentic/last-context.md'), `${context.join('\n')}\n`)

console.log(context.join('\n'))
