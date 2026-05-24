import { t } from 'elysia'

export const PostBody = t.Object({
  id: t.Optional(t.String()),
  imageSrc: t.Optional(t.String()),
  images: t.Optional(t.Array(t.String())),
  title: t.String(),
  content: t.Optional(t.String()),
  location: t.Optional(t.String()),
  time: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  pinned: t.Optional(t.Boolean()),
})

export const SiteProfileBody = t.Object({
  avatarUrl: t.Optional(t.String()),
  badgeEnabled: t.Optional(t.Boolean()),
  badge: t.Optional(t.String()),
  avatarStatus: t.Optional(t.String()),
  nickname: t.Optional(t.String()),
  handle: t.Optional(t.String()),
  bio: t.Optional(t.String()),
})

export const ContactLinkBody = t.Object({
  id: t.Optional(t.String()),
  label: t.String(),
  value: t.Optional(t.String()),
  href: t.String(),
  icon: t.Optional(t.String()),
  enabled: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

export const AboutCollapseItemBody = t.Object({
  id: t.Optional(t.String()),
  question: t.String(),
  content: t.String(),
  defaultExpanded: t.Optional(t.Boolean()),
  disabled: t.Optional(t.Boolean()),
  enabled: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

export const AboutContentBody = t.Object({
  intro: t.Optional(t.String()),
  projectQuestion: t.Optional(t.String()),
  projectSummary: t.Optional(t.String()),
  contacts: t.Optional(t.Array(ContactLinkBody)),
  collapseItems: t.Optional(t.Array(AboutCollapseItemBody)),
})

export const AdminLoginBody = t.Object({
  account: t.Optional(t.String()),
  password: t.String(),
  turnstileToken: t.Optional(t.String()),
})

export const AdminRefreshBody = t.Object({
  refreshToken: t.String(),
})

export const AdminAccountBody = t.Object({
  account: t.String(),
  currentPassword: t.String(),
  newPassword: t.Optional(t.String()),
})

export const MusicBody = t.Object({
  enabled: t.Boolean(),
  platform: t.Literal('netease'),
  sourceType: t.String(),
  musicId: t.String(),
})
