import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const stickerFile = 'src/data/sticker-packs.ts'
const outputDir = 'public/stickers/zhihu'

const source = await readFile(stickerFile, 'utf8')
const stickers = [...source.matchAll(/\{ alt: '([^']+)', src: '(https:\/\/[^']+)' \}/g)].map((match, index) => ({
  alt: match[1],
  src: match[2],
  filename: `${String(index + 1).padStart(2, '0')}.png`,
}))

if (!stickers.length) {
  console.log('No remote stickers found.')
  process.exit(0)
}

await mkdir(outputDir, { recursive: true })

let nextSource = source

for (const sticker of stickers) {
  const localUrl = `/stickers/zhihu/${sticker.filename}`
  const localPath = path.join(outputDir, sticker.filename)

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
console.log(`Localized ${stickers.length} stickers to ${outputDir}`)
