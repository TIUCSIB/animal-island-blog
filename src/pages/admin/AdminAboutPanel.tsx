import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Button, Card, Input, Modal, Select, Switch } from 'animal-island-ui'
import { FileText, Globe2, Plus, Trash2 } from 'lucide-react'

import type { ContactIconName } from '@/data/about-content'
import type { AboutContentForm, SetAboutContentForm } from './types'

const contactIconOptions = [
  { key: 'github', label: 'GitHub' },
  { key: 'mail', label: 'Email' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'bilibili', label: 'Bilibili' },
  { key: 'website', label: 'Website' },
]

type AdminAboutPanelProps = {
  aboutContentForm: AboutContentForm
  saving: boolean
  setAboutContentForm: SetAboutContentForm
  onSaveAboutContent: FormEventHandler<HTMLFormElement>
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

export function AdminAboutPanel({ aboutContentForm, saving, setAboutContentForm, onSaveAboutContent }: AdminAboutPanelProps) {
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
    <section className="island-admin-panel island-admin-about-panel">
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
