import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  account: text('account').notNull(),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const siteProfiles = sqliteTable('site_profiles', {
  id: text('id').primaryKey(),
  avatarUrl: text('avatar_url').notNull(),
  badgeEnabled: integer('badge_enabled', { mode: 'boolean' }).notNull().default(true),
  badge: text('badge').notNull().default('♥'),
  avatarStatus: text('avatar_status', { enum: ['online', 'away', 'busy', ''] }).notNull().default(''),
  nickname: text('nickname').notNull(),
  handle: text('handle').notNull(),
  bio: text('bio').notNull().default(''),
  updatedAt: text('updated_at').notNull(),
})

export const aboutPages = sqliteTable('about_pages', {
  id: text('id').primaryKey(),
  intro: text('intro').notNull(),
  projectQuestion: text('project_question').notNull(),
  projectSummary: text('project_summary').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const contactLinks = sqliteTable('contact_links', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  href: text('href').notNull(),
  icon: text('icon').notNull().default('website'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const aboutTechSections = sqliteTable('about_tech_sections', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  itemsJson: text('items_json').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const aboutCollapseItems = sqliteTable('about_collapse_items', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  content: text('content').notNull(),
  defaultExpanded: integer('default_expanded', { mode: 'boolean' }).notNull().default(false),
  disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  location: text('location').notNull().default(''),
  time: text('time').notNull(),
  imageSrc: text('image_src').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const postAssets = sqliteTable('post_assets', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('public_id').notNull().default(''),
  resourceType: text('resource_type', { enum: ['image', 'video'] }).notNull().default('image'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const postTags = sqliteTable('post_tags', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const musicConfigs = sqliteTable('music_configs', {
  id: text('id').primaryKey(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  platform: text('platform', { enum: ['netease'] }).notNull().default('netease'),
  sourceType: text('source_type', { enum: ['song', 'playlist'] }).notNull().default('song'),
  musicId: text('music_id').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const musicTracks = sqliteTable('music_tracks', {
  id: text('id').primaryKey(),
  configId: text('config_id').notNull().references(() => musicConfigs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  pic: text('pic').notNull().default(''),
  url: text('url').notNull(),
  lrc: text('lrc').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
})
