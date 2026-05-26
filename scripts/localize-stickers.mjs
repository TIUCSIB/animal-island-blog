import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const stickerFile = 'src/data/sticker-packs.ts'

const source = await readFile(stickerFile, 'utf8')
const packMatches = [
  ...source.matchAll(/id: '([^']+)',[\s\S]*?stickers: \[([\s\S]*?)\]\s*,/g),
]

const stickers = packMatches.flatMap((packMatch) => {
  const packId = packMatch[1]
  const packBody = packMatch[2]

  return [...packBody.matchAll(/\{ alt: '([^']+)', src: '([^']+)' \}/g)]
    .map((match, index) => ({
      packId,
      alt: match[1],
      src: match[2],
      filename: `${String(index + 1).padStart(2, '0')}.png`,
    }))
    .filter((sticker) => sticker.src.startsWith('https://'))
})

if (!stickers.length) {
  console.log('No remote stickers found.')
  process.exit(0)
}

let nextSource = source

for (const sticker of stickers) {
  const outputDir = `public/stickers/${sticker.packId}`
  const localUrl = `/stickers/${sticker.packId}/${sticker.filename}`
  const localPath = path.join(outputDir, sticker.filename)

  await mkdir(outputDir, { recursive: true })

  if (!existsSync(localPath)) {
    const response = await fetch(sticker.src, {
      headers: {
        'user-agent': 'animal-island-blog-sticker-localizer',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download ${sticker.alt}: ${response.status} ${response.statusText}`)
    }

    await writeFile(localPath, Buffer.from(await response.arrayBuffer()))
  }

  nextSource = nextSource.replace(sticker.src, localUrl)
}

await writeFile(stickerFile, nextSource, 'utf8')
console.log(`Localized ${stickers.length} stickers.`)
