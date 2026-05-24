import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, Collapse, Divider, Typewriter } from 'animal-island-ui'
import { Drum, Globe2, Mail, Music2, Snail } from 'lucide-react'

import { IslandBadge, IslandText } from '@/components/island'
import { defaultAboutContent } from '@/data/about-content'
import type { ContactIconName } from '@/data/about-content'
import { defaultSiteProfile } from '@/data/site-profile'
import { fetchAboutContent, fetchSiteProfile } from '@/lib/posts-api'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'

import '@/components/island/island.css'

const contactIconMap = {
  bilibili: Music2,
  github: Snail,
  instagram: Drum,
  mail: Mail,
  website: Globe2,
} satisfies Record<ContactIconName, typeof Globe2>

export default function AboutPage() {
  const navigate = useNavigate()
  const [siteProfile, setSiteProfile] = useState(defaultSiteProfile)
  const [aboutContent, setAboutContent] = useState(defaultAboutContent)
  const enabledContacts = useMemo(() => aboutContent.contacts.filter((contact) => contact.enabled).sort((left, right) => left.sortOrder - right.sortOrder), [aboutContent.contacts])
  const enabledCollapseItems = useMemo(
    () => aboutContent.collapseItems.filter((item) => item.enabled && item.question && item.content).sort((left, right) => left.sortOrder - right.sortOrder),
    [aboutContent.collapseItems],
  )

  useEffect(() => {
    const controller = new AbortController()

    fetchSiteProfile(controller.signal)
      .then(setSiteProfile)
      .catch(() => {
        // 后端未启动时继续使用本地默认资料。
      })
    fetchAboutContent(controller.signal)
      .then(setAboutContent)
      .catch(() => {
        // 后端未启动时继续使用本地默认关于页。
      })

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <div className="island-about-shell m-auto max-w-lg px-5 pt-7.5">
      <Button className="island-about-page__back" type="primary" size="small" onClick={() => navigate('/')}>
        ← 返回首页
      </Button>
      <SiteHeader profile={siteProfile} />

      <main className="island-about-page">
        <IslandBadge dot tone="green">
          <div className="island-about-page__intro">关于小岛</div>
        </IslandBadge>
        <Card type="dashed" className="island-about-page__card">
          <Typewriter speed={36}>{aboutContent.intro}</Typewriter>
        </Card>

        <Divider type="line-yellow" className="island-about-page__footer" />
        <IslandBadge dot tone="pink">
          <div className="island-about-page__intro">岛主</div>
        </IslandBadge>
        <div className="island-about-page__contacts" aria-label="联系方式">
          {enabledContacts.map((contact) => {
            const ContactIcon = contactIconMap[contact.icon] ?? Globe2

            return (
              <a
                key={contact.id}
                className="island-about-page__contact"
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                <span className="island-about-page__contact-icon" aria-hidden="true">
                  <ContactIcon />
                </span>
                <span className="island-about-page__contact-main">
                  <strong>{contact.label}</strong>
                  <small>{contact.value}</small>
                </span>
              </a>
            )
          })}
        </div>
        <Divider type="line-teal" className="island-about-page__footer" />

        <section className="mt-5">
          <IslandBadge dot tone="yellow">
            <div className="island-about-page__intro">{aboutContent.projectQuestion}</div>
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
      </main>

      <SiteFooter />
    </div>
  )
}
