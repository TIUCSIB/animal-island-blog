export function normalizeIslandAccount(value: string) {
  return value.trim()
}

export function toAccountInputValue(value: string) {
  return value.trim()
}

export function formatIslandAccountDisplay(value?: string, fallback = 'island-admin') {
  const account = normalizeIslandAccount(value ?? '')

  return account || fallback
}
