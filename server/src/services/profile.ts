import { eq } from 'drizzle-orm'

import { defaultSiteProfile, SITE_PROFILE_ID } from '../constants'
import { getDb } from '../db'
import { siteProfiles } from '../db/schema'
import { normalizeSiteProfile } from '../normalizers'
import type { SiteProfile } from '../types'

export async function getSiteProfile() {
  const profile = await getDb().select().from(siteProfiles).where(eq(siteProfiles.id, SITE_PROFILE_ID)).get()

  if (!profile) return defaultSiteProfile

  return {
    avatarUrl: profile.avatarUrl,
    badgeEnabled: profile.badgeEnabled,
    badge: profile.badge,
    avatarStatus: profile.avatarStatus,
    nickname: profile.nickname,
    handle: profile.handle,
    bio: profile.bio,
    updatedAt: profile.updatedAt,
  } satisfies SiteProfile
}

export async function saveSiteProfile(input: unknown) {
  const profile = normalizeSiteProfile(input as Partial<SiteProfile>)
  const db = getDb()
  const now = new Date().toISOString()
  const existing = await db.select({ id: siteProfiles.id }).from(siteProfiles).where(eq(siteProfiles.id, SITE_PROFILE_ID)).get()

  if (existing) {
    await db
      .update(siteProfiles)
      .set({
        avatarUrl: profile.avatarUrl,
        badgeEnabled: profile.badgeEnabled,
        badge: profile.badge,
        avatarStatus: profile.avatarStatus,
        nickname: profile.nickname,
        handle: profile.handle,
        bio: profile.bio,
        updatedAt: now,
      })
      .where(eq(siteProfiles.id, SITE_PROFILE_ID))
  } else {
    await db.insert(siteProfiles).values({
      id: SITE_PROFILE_ID,
      avatarUrl: profile.avatarUrl,
      badgeEnabled: profile.badgeEnabled,
      badge: profile.badge,
      avatarStatus: profile.avatarStatus,
      nickname: profile.nickname,
      handle: profile.handle,
      bio: profile.bio,
      updatedAt: now,
    })
  }

  return getSiteProfile()
}
