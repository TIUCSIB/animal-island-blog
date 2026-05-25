export type PostMediaLibraryMode = 'gallery'

export const MAX_POST_IMAGES = 9

export function appendPostImageUrl(currentText: string, url: string, max = MAX_POST_IMAGES) {
  const urls = getPostImageUrls(currentText)

  if (!urls.includes(url)) urls.push(url)

  return urls.slice(0, max).join('\n')
}

export function removePostImageUrl(currentText: string, url: string) {
  return getPostImageUrls(currentText).filter((item) => item !== url).join('\n')
}

export function getPostImageUrls(text: string) {
  return text
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
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
