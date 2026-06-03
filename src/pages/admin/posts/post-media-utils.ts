export type PostMediaLibraryMode = 'gallery' | 'videos'

export const MAX_POST_IMAGES = 9
export const MAX_POST_VIDEOS = 1

export function getPostMediaUrls(text: string) {
  return text
    .split(/[\n,\uFF0C\u3001]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function appendPostMediaUrl(currentText: string, url: string, max: number) {
  const urls = getPostMediaUrls(currentText)

  if (!urls.includes(url)) urls.push(url)

  return urls.slice(0, max).join('\n')
}

export function removePostMediaUrl(currentText: string, url: string) {
  return getPostMediaUrls(currentText).filter((item) => item !== url).join('\n')
}

export function appendPostImageUrl(currentText: string, url: string, max = MAX_POST_IMAGES) {
  return appendPostMediaUrl(currentText, url, max)
}

export function removePostImageUrl(currentText: string, url: string) {
  return removePostMediaUrl(currentText, url)
}

export function getPostImageUrls(text: string) {
  return getPostMediaUrls(text)
}

export function appendPostVideoUrl(currentText: string, url: string, max = MAX_POST_VIDEOS) {
  return appendPostMediaUrl(currentText, url, max)
}

export function removePostVideoUrl(currentText: string, url: string) {
  return removePostMediaUrl(currentText, url)
}

export function getPostVideoUrls(text: string) {
  return getPostMediaUrls(text)
}

export function formatPostDate(value: string) {
  if (!value) return '未填写'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function reorderPostImages(currentText: string, fromIndex: number, toIndex: number): string {
  const urls = getPostMediaUrls(currentText)
  if (fromIndex < 0 || fromIndex >= urls.length || toIndex < 0 || toIndex >= urls.length) return currentText
  const [moved] = urls.splice(fromIndex, 1)
  urls.splice(toIndex, 0, moved)
  return urls.join('\n')
}