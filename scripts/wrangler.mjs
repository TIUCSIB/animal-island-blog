import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

process.env.WRANGLER_LOG_PATH ||= resolve('.wrangler/logs')
mkdirSync(process.env.WRANGLER_LOG_PATH, { recursive: true })

const require = createRequire(import.meta.url)
const wranglerBin = require.resolve('wrangler/bin/wrangler.js')
const child = spawn(process.execPath, [wranglerBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
