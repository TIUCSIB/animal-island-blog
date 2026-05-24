import { asc, eq } from 'drizzle-orm'

import { ABOUT_PAGE_ID, defaultAboutContent } from '../constants'
import { getDb } from '../db'
import { aboutCollapseItems, aboutPages, contactLinks } from '../db/schema'
import { normalizeAboutContent, normalizeContactIcon } from '../normalizers'
import type { AboutContent, AboutContentInput } from '../types'

export async function getAboutContent() {
  const db = getDb()
  const about = await db.select().from(aboutPages).where(eq(aboutPages.id, ABOUT_PAGE_ID)).get()

  if (!about) return defaultAboutContent

  const contacts = await db.select().from(contactLinks).orderBy(asc(contactLinks.sortOrder)).all()
  const collapseRows = await db.select().from(aboutCollapseItems).orderBy(asc(aboutCollapseItems.sortOrder)).all()
  const collapseItems = collapseRows.map((item) => ({
    id: item.id,
    question: item.question,
    content: item.content,
    defaultExpanded: item.defaultExpanded,
    disabled: item.disabled,
    enabled: item.enabled,
    sortOrder: item.sortOrder,
  }))

  return {
    intro: about.intro,
    projectQuestion: about.projectQuestion,
    projectSummary: about.projectSummary,
    contacts: contacts.map((contact) => ({
      id: contact.id,
      label: contact.label,
      value: contact.value,
      href: contact.href,
      icon: normalizeContactIcon(contact.icon),
      enabled: contact.enabled,
      sortOrder: contact.sortOrder,
    })),
    collapseItems: collapseItems.length > 0 ? collapseItems : [
      {
        id: 'about-project',
        question: '这是一个怎样的网站？',
        content: about.projectSummary || defaultAboutContent.projectSummary,
        defaultExpanded: true,
        disabled: false,
        enabled: true,
        sortOrder: 0,
      },
    ],
    updatedAt: about.updatedAt,
  } satisfies AboutContent
}

export async function saveAboutContent(input: unknown) {
  const about = normalizeAboutContent(input as AboutContentInput)
  const db = getDb()
  const now = new Date().toISOString()
  const existing = await db.select({ id: aboutPages.id }).from(aboutPages).where(eq(aboutPages.id, ABOUT_PAGE_ID)).get()

  if (existing) {
    await db
      .update(aboutPages)
      .set({
        intro: about.intro,
        projectQuestion: about.projectQuestion,
        projectSummary: about.projectSummary,
        updatedAt: now,
      })
      .where(eq(aboutPages.id, ABOUT_PAGE_ID))
  } else {
    await db.insert(aboutPages).values({
      id: ABOUT_PAGE_ID,
      intro: about.intro,
      projectQuestion: about.projectQuestion,
      projectSummary: about.projectSummary,
      updatedAt: now,
    })
  }

  await db.delete(contactLinks)
  await db.delete(aboutCollapseItems)

  if (about.contacts.length > 0) {
    await db.insert(contactLinks).values(
      about.contacts.map((contact, index) => ({
        id: contact.id,
        label: contact.label,
        value: contact.value,
        href: contact.href,
        icon: contact.icon,
        enabled: contact.enabled,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })),
    )
  }

  if (about.collapseItems.length > 0) {
    await db.insert(aboutCollapseItems).values(
      about.collapseItems.map((item, index) => ({
        id: item.id,
        question: item.question,
        content: item.content,
        defaultExpanded: item.defaultExpanded,
        disabled: item.disabled,
        enabled: item.enabled,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })),
    )
  }

  return getAboutContent()
}
