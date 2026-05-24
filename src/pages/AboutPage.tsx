import { useMemo } from 'react'
import { Card, Collapse, Divider, Typewriter } from 'animal-island-ui'
import { Camera, Cat, Globe2, Mail, Tv } from 'lucide-react'

import { IslandBadge, IslandText } from '@/components/island'
import { defaultAboutContent } from '@/data/about-content'
import type { AboutContent, ContactIconName } from '@/data/about-content'
import { useAboutContentQuery } from '@/lib/query-hooks'

import '@/components/island/island.css'

const contactIconMap = {
  bilibili: Tv,
  github: Cat,
  instagram: Camera,
  mail: Mail,
  website: Globe2,
} satisfies Record<ContactIconName, typeof Globe2>

export default function AboutPage() {
  const aboutContentQuery = useAboutContentQuery()
  const aboutContent: AboutContent | null = aboutContentQuery.data ?? (aboutContentQuery.isError ? defaultAboutContent : null)
  const enabledContacts = useMemo(() => (aboutContent?.contacts ?? []).filter((contact) => contact.enabled).sort((left, right) => left.sortOrder - right.sortOrder), [aboutContent?.contacts])
  const enabledCollapseItems = useMemo(
    () => (aboutContent?.collapseItems ?? []).filter((item) => item.enabled && item.question && item.content).sort((left, right) => left.sortOrder - right.sortOrder),
    [aboutContent?.collapseItems],
  )

  return (
    <div className="island-about-shell">
      <section className="island-about-page">
        <IslandBadge dot tone="green">
          <div className="island-about-page__intro">关于小岛</div>
        </IslandBadge>
        <Card type="dashed" className="island-about-page__card">
          {aboutContent ?
            <Typewriter key={aboutContent.updatedAt ?? aboutContent.intro} speed={36}>
              {aboutContent.intro}
            </Typewriter>
          : <span className="island-about-page__loading">正在读取小岛资料...</span>}
        </Card>

        <Divider type="line-yellow" className="island-about-page__footer" />
        <IslandBadge dot tone="pink">
          <div className="island-about-page__intro">岛主</div>
        </IslandBadge>
        <div className="island-about-page__contacts" aria-label="联系方式">
          {aboutContent ?
            enabledContacts.map((contact) => {
              const ContactIcon = contactIconMap[contact.icon] ?? Globe2

              return (
                <a
                  key={contact.id}
                  className="island-about-page__contact"
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <span className={`island-about-page__contact-icon island-about-page__contact-icon--${contact.icon}`} aria-hidden="true">
                    <ContactIcon />
                  </span>
                  <span className="island-about-page__contact-main">
                    <strong>{contact.label}</strong>
                    <small>{contact.value}</small>
                  </span>
                </a>
              )
            })
          : <div className="island-about-page__contact island-about-page__contact--loading">
              <span className="island-about-page__contact-icon island-about-page__contact-icon--loading" />
              <span className="island-about-page__contact-main">
                <strong>正在读取联系方式</strong>
                <small>稍等一下，小岛正在连线...</small>
              </span>
            </div>
          }
        </div>
        <Divider type="line-teal" className="island-about-page__footer" />

        <section className="mt-5">
          <IslandBadge dot tone="yellow">
            <div className="island-about-page__intro">{aboutContent?.projectQuestion ?? '小岛资料读取中'}</div>
          </IslandBadge>
          <div className="island-about-page__contacts">
            {enabledCollapseItems.map((item) => (
              <Collapse
                key={item.id}
                question={item.question}
                answer={
                  <section className="island-about-page__project">
                    <IslandText tone="yellow" variant="caption">
                      {item.content}
                    </IslandText>
                  </section>
                }
                defaultExpanded={item.defaultExpanded}
                disabled={item.disabled}
              />
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
