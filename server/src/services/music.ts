import { asc, eq } from 'drizzle-orm'

import { CONFIG_ID, defaultMusic, MUSIC_API_BASE_URL } from '../constants'
import { getDb } from '../db'
import { musicConfigs, musicTracks } from '../db/schema'
import { HttpError } from '../http'
import { normalizeMusicTrack } from '../normalizers'
import type { MusicSourceType } from '../types'
import { cleanText } from '../utils'

type MusicConfigInput = {
  enabled?: unknown
  platform?: unknown
  sourceType?: unknown
  musicId?: unknown
}

async function fetchMusicTracks(sourceType: MusicSourceType, musicId: string) {
  const url = new URL(MUSIC_API_BASE_URL)

  url.searchParams.set('server', 'netease')
  url.searchParams.set('type', sourceType)
  url.searchParams.set('id', musicId)

  const response = await fetch(url)

  if (!response.ok) {
    throw new HttpError(502, '音乐接口请求失败')
  }

  const data = await response.json()
  const list = Array.isArray(data) ? data : [data]
  const tracks = list.map(normalizeMusicTrack).filter((track) => track.url)

  if (tracks.length === 0) {
    throw new HttpError(422, '没有解析到可播放的歌曲')
  }

  return tracks
}

export async function getMusicConfig() {
  const db = getDb()
  const config = await db.select().from(musicConfigs).where(eq(musicConfigs.id, CONFIG_ID)).get()

  if (!config) return defaultMusic

  const tracks = await db.select().from(musicTracks).where(eq(musicTracks.configId, CONFIG_ID)).orderBy(asc(musicTracks.sortOrder)).all()

  return {
    enabled: config.enabled,
    platform: config.platform,
    sourceType: config.sourceType,
    musicId: config.musicId,
    tracks: tracks.map((track) => ({
      title: track.title,
      author: track.author,
      pic: track.pic,
      url: track.url,
      lrc: track.lrc,
    })),
    updatedAt: config.updatedAt,
  }
}

export async function saveMusicConfig(input: MusicConfigInput) {
  const sourceType = input.sourceType === 'playlist' ? 'playlist' : 'song'
  const musicId = cleanText(input.musicId)

  if (!musicId) throw new HttpError(400, '请填写歌曲 ID 或歌单 ID')

  const tracks = await fetchMusicTracks(sourceType, musicId)
  const db = getDb()
  const now = new Date().toISOString()
  const existing = await db.select({ id: musicConfigs.id }).from(musicConfigs).where(eq(musicConfigs.id, CONFIG_ID)).get()

  if (existing) {
    await db
      .update(musicConfigs)
      .set({
        enabled: input.enabled !== false,
        platform: 'netease',
        sourceType,
        musicId,
        updatedAt: now,
      })
      .where(eq(musicConfigs.id, CONFIG_ID))
  } else {
    await db.insert(musicConfigs).values({
      id: CONFIG_ID,
      enabled: input.enabled !== false,
      platform: 'netease',
      sourceType,
      musicId,
      updatedAt: now,
    })
  }

  await db.delete(musicTracks).where(eq(musicTracks.configId, CONFIG_ID))
  await db.insert(musicTracks).values(
    tracks.map((track, index) => ({
      id: crypto.randomUUID(),
      configId: CONFIG_ID,
      title: track.title,
      author: track.author,
      pic: track.pic,
      url: track.url,
      lrc: track.lrc ?? '',
      sortOrder: index,
    })),
  )

  return getMusicConfig()
}
