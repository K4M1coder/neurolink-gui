import { execFileSync } from 'node:child_process'

const [kind, domain, owner, ...topicParts] = process.argv.slice(2)
const domains = new Set([
  'desktop-shell',
  'cli-runtime',
  'command-catalog',
  'wsl-platform',
  'packaging',
  'release',
])
const kinds = new Set(['feature', 'bugfix', 'refactor', 'docs'])

function fail(message) {
  console.error(`branch:new: ${message}`)
  process.exit(1)
}

function sanitize(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

if (!kinds.has(kind)) fail(`kind must be one of ${[...kinds].join(', ')}`)
if (!domains.has(domain)) fail(`domain must be one of ${[...domains].join(', ')}`)
if (!owner) fail('owner is required')
if (!topicParts.length) fail('topic is required')

let resolvedOwner = sanitize(owner)
if (!resolvedOwner) fail('owner is invalid')

const topic = sanitize(topicParts.join('-'))
if (!topic) fail('topic is invalid')

const branch = `${kind}/${domain}/${resolvedOwner}/${topic}`
execFileSync('git', ['switch', '-c', branch], { stdio: 'inherit' })
console.log(`Created ${branch}`)
