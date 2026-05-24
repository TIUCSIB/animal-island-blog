import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Button, Card, Input, Modal, Select, Switch } from 'animal-island-ui'
import { AtSign, FileText, Globe2, Heart, ImageIcon, MessageCircle, Plus, Trash2, UserRound } from 'lucide-react'

import { IslandAvatar } from '@/components/island'
import type { ContactIconName } from '@/data/about-content'
import type { AboutContentForm, SetAboutContentForm, SetSiteProfileForm, SiteProfileForm } from './types'

const avatarStatusOptions = [
  { key: '', label: '关闭状态' },
  { key: 'online', label: '在线' },
  { key: 'away', label: '离开' },
  { key: 'busy', label: '忙碌' },
]

const contactIconOptions = [
  { key: 'github', label: 'GitHub' },
  { key: 'mail', label: 'Email' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'bilibili', label: 'Bilibili' },
  { key: 'website', label: 'Website' },
]

type AdminSitePanelProps = {
  aboutContentForm: AboutContentForm
  saving: boolean
  siteProfileForm: SiteProfileForm
  setAboutContentForm: SetAboutContentForm
  setSiteProfileForm: SetSiteProfileForm
  onSaveAboutContent: FormEventHandler<HTMLFormElement>
  onSaveSiteProfile: FormEventHandler<HTMLFormElement>
}

type PendingAboutDelete = {
  id: string
  title: string
  type: 'contact' | 'collapse'
} | null

function normalizeContactIcon(value: string): ContactIconName {
  if (value === 'github' || value === 'mail' || value === 'instagram' || value === 'bilibili' || value === 'website') return value

  return 'website'
}

export function AdminSitePanel({ aboutContentForm, saving, siteProfileForm, setAboutContentForm, setSiteProfileForm, onSaveAboutContent, onSaveSiteProfile }: AdminSitePanelProps) {
  const [pendingDelete, setPendingDelete] = useState<PendingAboutDelete>(null)

  function addContact() {
    setAboutContentForm((current) => ({
      ...current,
      contacts: [
        ...current.contacts,
        {
          id: crypto.randomUUID(),
          label: 'Website',
          value: '@mewbarkjoy',
          href: 'https://example.com',
          icon: 'website',
          enabled: true,
          sortOrder: current.contacts.length,
        },
      ],
    }))
  }

  function addCollapseItem() {
    setAboutContentForm((current) => ({
      ...current,
      collapseItems: [
        ...current.collapseItems,
        {
          id: crypto.randomUUID(),
          question: '新的问题',
          content: '这里填写折叠内容。',
          defaultExpanded: false,
          disabled: false,
          enabled: true,
          sortOrder: current.collapseItems.length,
        },
      ],
    }))
  }

  function confirmDeleteAboutItem() {
    if (!pendingDelete) return

    setAboutContentForm((current) => {
      if (pendingDelete.type === 'contact') {
        return {
          ...current,
          contacts: current.contacts.filter((contact) => contact.id !== pendingDelete.id),
        }
      }

      return {
        ...current,
        collapseItems: current.collapseItems.filter((item) => item.id !== pendingDelete.id),
      }
    })
    setPendingDelete(null)
  }

  return (
    <section className="island-admin-panel island-admin-site-panel">
      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">站点管理</span>
            <h2>主页资料</h2>
          </div>
        </div>

        <form className="island-admin-profile-form" onSubmit={onSaveSiteProfile}>
          <div className="island-admin-account-form__title">
            <strong>个人资料</strong>
            <span>首页、关于页和文章详情都会读取这里。</span>
          </div>

          <div className="island-admin-profile-form__body">
            <div className="island-admin-profile-form__preview">
              <IslandAvatar
                badge={siteProfileForm.badgeEnabled ? siteProfileForm.badge : undefined}
                status={siteProfileForm.avatarStatus || undefined}
                src={siteProfileForm.avatarUrl}
                name={siteProfileForm.nickname}
                alt={siteProfileForm.nickname}
                shape="circle"
                className="size-18"
              />
              <div>
                <strong>{siteProfileForm.nickname || 'mewbarkjoy'}</strong>
                <span>{siteProfileForm.handle || '@mewbarkjoy'}</span>
              </div>
            </div>

            <div className="island-admin-profile-form__fields">
              <label className="island-admin-field">
                <span>头像地址</span>
                <Input
                  value={siteProfileForm.avatarUrl}
                  placeholder="https://..."
                  prefix={<ImageIcon size={15} strokeWidth={3} />}
                  allowClear
                  onChange={(event) => setSiteProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  onClear={() => setSiteProfileForm((current) => ({ ...current, avatarUrl: '' }))}
                />
              </label>

              <div className="island-admin-account-form__grid">
                <label className="island-admin-field">
                  <span>昵称</span>
                  <Input
                    value={siteProfileForm.nickname}
                    placeholder="mewbarkjoy"
                    prefix={<UserRound size={15} strokeWidth={3} />}
                    onChange={(event) => setSiteProfileForm((current) => ({ ...current, nickname: event.target.value }))}
                  />
                </label>

                <label className="island-admin-field">
                  <span>账号</span>
                  <Input
                    value={siteProfileForm.handle}
                    placeholder="@mewbarkjoy"
                    prefix={<AtSign size={15} strokeWidth={3} />}
                    onChange={(event) => setSiteProfileForm((current) => ({ ...current, handle: event.target.value }))}
                  />
                </label>

                <label className="island-admin-field">
                  <span>头像角标</span>
                  <Input
                    value={siteProfileForm.badge}
                    placeholder="♥"
                    prefix={<Heart size={15} strokeWidth={3} />}
                    disabled={!siteProfileForm.badgeEnabled}
                    onChange={(event) => setSiteProfileForm((current) => ({ ...current, badge: event.target.value }))}
                  />
                </label>
              </div>

              <div className="island-admin-profile-options">
                <div className="island-admin-profile-option">
                  <span className="island-admin-profile-option__text">
                    <strong>头像角标</strong>
                    <small>{siteProfileForm.badgeEnabled ? '正在显示角标' : '已隐藏角标'}</small>
                  </span>
                  <Switch size="small" checked={siteProfileForm.badgeEnabled} onChange={(checked) => setSiteProfileForm((current) => ({ ...current, badgeEnabled: checked }))} />
                </div>

                <div className="island-admin-profile-option island-admin-profile-option--select">
                  <span className="island-admin-profile-option__text">
                    <strong>头像状态</strong>
                    <small>{siteProfileForm.avatarStatus ? '显示状态点' : '不显示状态点'}</small>
                  </span>
                  <Select
                    value={siteProfileForm.avatarStatus}
                    options={avatarStatusOptions}
                    onChange={(avatarStatus) =>
                      setSiteProfileForm((current) => ({
                        ...current,
                        avatarStatus: avatarStatus === 'online' || avatarStatus === 'away' || avatarStatus === 'busy' ? avatarStatus : '',
                      }))
                    }
                  />
                </div>
              </div>

              <label className="island-admin-field">
                <span>签名</span>
                <Input
                  value={siteProfileForm.bio}
                  placeholder="你好，我是一个程序员"
                  prefix={<MessageCircle size={15} strokeWidth={3} />}
                  onChange={(event) => setSiteProfileForm((current) => ({ ...current, bio: event.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="island-admin-system-actions">
            <Button type="primary" htmlType="submit" loading={saving}>
              保存
            </Button>
          </div>
        </form>
      </Card>

      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">关于页面</span>
            <h2>内容设置</h2>
          </div>
        </div>

        <form className="island-admin-about-form" onSubmit={onSaveAboutContent}>
          <label className="island-admin-field">
            <span>自我介绍</span>
            <textarea className="island-admin-textarea" value={aboutContentForm.intro} rows={4} onChange={(event) => setAboutContentForm((current) => ({ ...current, intro: event.target.value }))} />
          </label>

          <div className="island-admin-section-title">
            <strong>联系方式</strong>
            <Button type="default" size="small" htmlType="button" icon={<Plus size={14} strokeWidth={3} />} onClick={addContact}>
              添加
            </Button>
          </div>

          <div className="island-admin-edit-list">
            {aboutContentForm.contacts.map((contact, index) => (
              <div key={contact.id} className="island-admin-edit-card island-admin-edit-card--contact">
                <label className="island-admin-field">
                  <span>名称</span>
                  <Input
                    value={contact.label}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        contacts: current.contacts.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)),
                      }))
                    }
                  />
                </label>
                <label className="island-admin-field">
                  <span>展示文字</span>
                  <Input
                    value={contact.value}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        contacts: current.contacts.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)),
                      }))
                    }
                  />
                </label>
                <label className="island-admin-field">
                  <span>链接</span>
                  <Input
                    value={contact.href}
                    prefix={<Globe2 size={15} strokeWidth={3} />}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        contacts: current.contacts.map((item, itemIndex) => (itemIndex === index ? { ...item, href: event.target.value } : item)),
                      }))
                    }
                  />
                </label>
                <div className="island-admin-edit-card__actions">
                  <Select
                    value={contact.icon}
                    options={contactIconOptions}
                    onChange={(icon) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        contacts: current.contacts.map((item, itemIndex) => (itemIndex === index ? { ...item, icon: normalizeContactIcon(icon) } : item)),
                      }))
                    }
                  />
                  <Switch
                    size="small"
                    checked={contact.enabled}
                    onChange={(enabled) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        contacts: current.contacts.map((item, itemIndex) => (itemIndex === index ? { ...item, enabled } : item)),
                      }))
                    }
                  />
                  <Button
                    type="default"
                    danger
                    size="small"
                    htmlType="button"
                    icon={<Trash2 size={14} strokeWidth={3} />}
                    onClick={() => setPendingDelete({ id: contact.id, title: contact.label || contact.value || '联系方式', type: 'contact' })}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="island-admin-section-title">
            <strong>常见问题</strong>
            <Button type="default" size="small" htmlType="button" icon={<Plus size={14} strokeWidth={3} />} onClick={addCollapseItem}>
              添加
            </Button>
          </div>

          <label className="island-admin-field">
            <span>常见问题标题</span>
            <Input
              value={aboutContentForm.projectQuestion}
              prefix={<FileText size={15} strokeWidth={3} />}
              onChange={(event) => setAboutContentForm((current) => ({ ...current, projectQuestion: event.target.value }))}
            />
          </label>

          <div className="island-admin-edit-list">
            {aboutContentForm.collapseItems.map((item, index) => (
              <div key={item.id} className="island-admin-edit-card island-admin-edit-card--collapse">
                <label className="island-admin-field">
                  <span>问题</span>
                  <Input
                    value={item.question}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        collapseItems: current.collapseItems.map((collapseItem, itemIndex) => (itemIndex === index ? { ...collapseItem, question: event.target.value } : collapseItem)),
                      }))
                    }
                  />
                </label>
                <label className="island-admin-field">
                  <span>内容</span>
                  <textarea
                    className="island-admin-textarea island-admin-textarea--small"
                    value={item.content}
                    rows={3}
                    onChange={(event) =>
                      setAboutContentForm((current) => ({
                        ...current,
                        collapseItems: current.collapseItems.map((collapseItem, itemIndex) => (itemIndex === index ? { ...collapseItem, content: event.target.value } : collapseItem)),
                      }))
                    }
                  />
                </label>
                <div className="island-admin-edit-card__actions">
                  <span className="island-admin-mini-switch">
                    <small>默认展开</small>
                    <Switch
                      size="small"
                      checked={item.defaultExpanded}
                      onChange={(defaultExpanded) =>
                        setAboutContentForm((current) => ({
                          ...current,
                          collapseItems: current.collapseItems.map((collapseItem, itemIndex) => (itemIndex === index ? { ...collapseItem, defaultExpanded } : collapseItem)),
                        }))
                      }
                    />
                  </span>
                  <span className="island-admin-mini-switch">
                    <small>禁用</small>
                    <Switch
                      size="small"
                      checked={item.disabled}
                      onChange={(disabled) =>
                        setAboutContentForm((current) => ({
                          ...current,
                          collapseItems: current.collapseItems.map((collapseItem, itemIndex) => (itemIndex === index ? { ...collapseItem, disabled } : collapseItem)),
                        }))
                      }
                    />
                  </span>
                  <span className="island-admin-mini-switch">
                    <small>显示</small>
                    <Switch
                      size="small"
                      checked={item.enabled}
                      onChange={(enabled) =>
                        setAboutContentForm((current) => ({
                          ...current,
                          collapseItems: current.collapseItems.map((collapseItem, itemIndex) => (itemIndex === index ? { ...collapseItem, enabled } : collapseItem)),
                        }))
                      }
                    />
                  </span>
                  <Button
                    type="default"
                    danger
                    size="small"
                    htmlType="button"
                    icon={<Trash2 size={14} strokeWidth={3} />}
                    onClick={() => setPendingDelete({ id: item.id, title: item.question || '常见问题', type: 'collapse' })}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="island-admin-system-actions">
            <Button type="primary" htmlType="submit" loading={saving}>
              保存
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        open={Boolean(pendingDelete)}
        title="确认操作"
        width={420}
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button htmlType="button" onClick={() => setPendingDelete(null)}>
              取消
            </Button>
            <Button type="primary" danger htmlType="button" onClick={confirmDeleteAboutItem}>
              删除
            </Button>
          </>
        }
      >
        {pendingDelete ? `「${pendingDelete.title}」你确定要删除吗?` : null}
      </Modal>
    </section>
  )
}
