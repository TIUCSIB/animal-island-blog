export type IslandToastType = 'success' | 'error' | 'info'

export type IslandToastInput = {
  type?: IslandToastType
  title: string
  description?: string
  duration?: number
}

export type IslandToastItem = Required<Pick<IslandToastInput, 'type' | 'title' | 'duration'>> & {
  id: string
  description?: string
}

export const ISLAND_TOAST_EVENT = 'island-toast'

export function createIslandToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function emitIslandToast(input: IslandToastInput) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<IslandToastInput>(ISLAND_TOAST_EVENT, {
      detail: input,
    }),
  )
}
