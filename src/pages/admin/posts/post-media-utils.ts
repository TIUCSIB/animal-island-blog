export type PostMediaLibraryMode = 'cover' | 'gallery'

export function appendPostImageUrl(currentText: string, url: string) {
  const urls = getPostImageUrls(currentText)

  if (!urls.includes(url)) urls.push(url)

  return urls.join('\n')
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
