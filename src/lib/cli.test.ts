import { describe, expect, it } from 'vitest'
import { buildCliInvocation, redactPreview, splitArgumentText } from './cli'

describe('CLI argument parsing', () => {
  it('preserves quoted prompts and repeatable options', () => {
    expect(splitArgumentText('"Write release notes" --file ./a.md --file ./b.md'))
      .toEqual(['Write release notes', '--file', './a.md', '--file', './b.md'])
  })

  it('builds a shell-free command invocation', () => {
    expect(buildCliInvocation('generate', '"Hello world" --format json', '/tmp', 'Ubuntu'))
      .toEqual({
        command: 'generate',
        args: ['Hello world', '--format', 'json'],
        cwd: '/tmp',
        distro: 'Ubuntu',
      })
  })

  it('redacts API keys and secret assignments', () => {
    expect(redactPreview('OPENAI_API_KEY=sk-abcdefghijk --password secret'))
      .not.toContain('sk-abcdefghijk')
  })
})
