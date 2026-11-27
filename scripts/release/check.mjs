import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

function fail(message) {
  console.error(`release:check: ${message}`)
  process.exit(1)
}

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const tauriConfig = JSON.parse(readFileSync(resolve(root, 'src-tauri/tauri.conf.json'), 'utf8'))
const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8')

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
  fail('package.json version is not valid SemVer')
}
if (packageJson.version !== tauriConfig.version) {
  fail(`version mismatch: package.json=${packageJson.version}, tauri=${tauriConfig.version}`)
}
if (!changelog.includes(`## [${packageJson.version}]`)) {
  fail(`CHANGELOG.md has no release entry for ${packageJson.version}`)
}
if (!existsSync(resolve(root, 'LICENSE'))) {
  fail('LICENSE is missing')
}

console.log(`Release metadata valid for ${packageJson.version}`)
