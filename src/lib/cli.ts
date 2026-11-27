export interface CliInvocation {
  command: string
  args: string[]
  cwd?: string
  distro?: string
}

export function splitArgumentText(value: string): string[] {
  const args: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let escaped = false

  for (const character of value.trim()) {
    if (escaped) {
      current += character
      escaped = false
      continue
    }
    if (character === '\\' && quote !== "'") {
      escaped = true
      continue
    }
    if (quote) {
      if (character === quote) {
        quote = null
      } else {
        current += character
      }
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (/\s/.test(character)) {
      if (current) {
        args.push(current)
        current = ''
      }
      continue
    }
    current += character
  }

  if (escaped) current += '\\'
  if (current) args.push(current)
  return args
}

export function buildCliInvocation(
  command: string,
  argumentText: string,
  cwd?: string,
  distro?: string,
): CliInvocation {
  const args = splitArgumentText(argumentText)
  return { command, args, cwd, distro }
}

export function redactPreview(text: string): string {
  return text
    .replace(/(api[_-]?key|access[_-]?token|password|secret)\s*[=:]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\b(sk-[A-Za-z0-9_-]{8,}|AIza[A-Za-z0-9_-]{12,})\b/g, '[REDACTED]')
}
