export function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(String(item))).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `post-${Date.now()}`
}

export function encodeBase64Url(input: string | ArrayBuffer | Uint8Array) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

export function decodeBase64UrlBytes(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)

  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}
