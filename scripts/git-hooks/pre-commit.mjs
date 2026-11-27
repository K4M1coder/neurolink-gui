import { execFileSync, spawnSync } from 'node:child_process'

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function run(command, args) {
  if (process.platform === 'win32') {
    return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command, ...args], {
      stdio: 'inherit',
    }).status
  }
  return spawnSync(command, args, { stdio: 'inherit' }).status
}

let branch = ''
try {
  branch = git(['symbolic-ref', '--short', 'HEAD'])
} catch {
  branch = 'detached'
}

if (branch === 'main') {
  console.error('Direct commits to main are prohibited.')
  process.exit(1)
}

const allowed = /^(feature|bugfix|refactor|docs)\/(desktop-shell|cli-runtime|command-catalog|wsl-platform|packaging|release)\/[a-z0-9-]+\/[a-z0-9-]+$|^(hotfix|release|support)\/[a-z0-9.-]+/
if (branch !== 'detached' && !allowed.test(branch)) {
  console.error(
    `Invalid branch name '${branch}'. Use feature|bugfix|refactor|docs/<domain>/<owner>/<topic>, hotfix/<topic>, release/vMAJOR.MINOR, or support/vMAJOR.MINOR.`,
  )
  process.exit(1)
}

const staged = git(['diff', '--cached', '--name-only'])
if (!staged) {
  console.error('No staged files.')
  process.exit(1)
}

const diff = git(['diff', '--cached', '--no-ext-diff', '--unified=0'])
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:api[_-]?key|access[_-]?token|password|secret)\s*[=:]\s*['"]?[A-Za-z0-9._-]{12,}/i,
]

for (const pattern of secretPatterns) {
  if (pattern.test(diff)) {
    console.error('Potential secret detected in staged changes.')
    process.exit(1)
  }
}

const corepack = 'corepack'
const cargo = 'cargo'
let status = 0

if (/^release\//.test(branch)) {
  status ||= run(corepack, ['pnpm', 'test'])
  status ||= run(corepack, ['pnpm', 'lint'])
  status ||= run(corepack, ['pnpm', 'build'])
  status ||= run(corepack, ['pnpm', 'release:check'])
  status ||= run(cargo, ['test', '--manifest-path', 'src-tauri/Cargo.toml'])
} else if (/^hotfix\//.test(branch)) {
  status ||= run(corepack, ['pnpm', 'test'])
  status ||= run(corepack, ['pnpm', 'lint'])
  status ||= run(cargo, ['test', '--manifest-path', 'src-tauri/Cargo.toml'])
} else if (branch !== 'detached') {
  status ||= run(corepack, ['pnpm', 'test'])
  status ||= run(corepack, ['pnpm', 'lint'])
  if (!/^docs\//.test(branch)) {
    status ||= run(cargo, ['check', '--manifest-path', 'src-tauri/Cargo.toml'])
  }
}

if (status) process.exit(status)
