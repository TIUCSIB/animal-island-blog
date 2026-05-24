export type ContactIconName = 'github' | 'mail' | 'instagram' | 'website' | 'bilibili'

export type ContactLink = {
  id: string
  label: string
  value: string
  href: string
  icon: ContactIconName
  enabled: boolean
  sortOrder: number
}

export type AboutCollapseItem = {
  id: string
  question: string
  content: string
  defaultExpanded: boolean
  disabled: boolean
  enabled: boolean
  sortOrder: number
}

export type AboutContent = {
  intro: string
  projectQuestion: string
  projectSummary: string
  contacts: ContactLink[]
  collapseItems: AboutCollapseItem[]
  updatedAt?: string
}

export const defaultAboutContent: AboutContent = {
  intro: '这里是图片小岛，用来收集日常、旅行、风景和一些平淡但可爱的瞬间。',
  projectQuestion: '小岛问答',
  projectSummary: '一个偏个人向的图片画廊和小博客，用来记录生活里的可爱碎片。',
  contacts: [
    {
      id: 'github',
      label: 'GitHub',
      value: '@mewbarkjoy',
      href: 'https://github.com/mewbarkjoy',
      icon: 'github',
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'email',
      label: 'Email',
      value: 'hello@mewbarkjoy.com',
      href: 'mailto:hello@mewbarkjoy.com',
      icon: 'mail',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      value: '@mewbarkjoy',
      href: 'https://www.instagram.com/mewbarkjoy',
      icon: 'instagram',
      enabled: true,
      sortOrder: 2,
    },
  ],
  collapseItems: [
    {
      id: 'about-project',
      question: '这是一个怎样的网站？',
      content: '一个偏个人向的图片画廊和小博客，用来记录生活里的可爱碎片。',
      defaultExpanded: true,
      disabled: false,
      enabled: true,
      sortOrder: 0,
    },
  ],
}
