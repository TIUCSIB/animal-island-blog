import { useState } from 'react'
import type { FormEventHandler } from 'react'
import { Button, Card, Input, Select, Switch } from 'animal-island-ui'
import { Citrus, Heart, ImageIcon, Images, MessageCircle, UserRound } from 'lucide-react'

import { IslandAvatar } from '@/components/island'
import { AdminAvatarLibraryModal } from './AdminAvatarLibraryModal'
import { AdminAvatarUploader } from './AdminAvatarUploader'
import type { SetSiteProfileForm, SiteProfileForm } from './types'

const avatarStatusOptions = [
  { key: '', label: '关闭状态' },
  { key: 'online', label: '在线' },
  { key: 'away', label: '离开' },
  { key: 'busy', label: '忙碌' },
]

type AdminSitePanelProps = {
  saving: boolean
  token: string
  siteProfileForm: SiteProfileForm
  setSiteProfileForm: SetSiteProfileForm
  onSaveSiteProfile: FormEventHandler<HTMLFormElement>
}

export function AdminSitePanel({ saving, token, siteProfileForm, setSiteProfileForm, onSaveSiteProfile }: AdminSitePanelProps) {
  const [avatarLibraryOpen, setAvatarLibraryOpen] = useState(false)

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
          </div>

          <div className="island-admin-profile-form__body">
            <div className="island-admin-profile-form__preview">
              <AdminAvatarUploader
                token={token}
                onUploaded={(asset) =>
                  setSiteProfileForm((current) => ({
                    ...current,
                    avatarUrl: asset.secureUrl,
                  }))
                }
              >
                <IslandAvatar
                  badge={siteProfileForm.badgeEnabled ? siteProfileForm.badge : undefined}
                  status={siteProfileForm.avatarStatus || undefined}
                  src={siteProfileForm.avatarUrl}
                  name={siteProfileForm.nickname}
                  alt={siteProfileForm.nickname}
                  shape="circle"
                  className="size-18"
                />
              </AdminAvatarUploader>
              <div>
                <strong>{siteProfileForm.nickname || 'mewbarkjoy'}</strong>
                <span>{siteProfileForm.handle || '@mewbarkjoy'}</span>
              </div>
              <Button type="default" size="small" htmlType="button" icon={<Images size={14} strokeWidth={3} />} onClick={() => setAvatarLibraryOpen(true)}>
                头像库
              </Button>
            </div>

            <div className="island-admin-profile-form__fields">
              <div className="island-admin-field">
                <span>头像地址</span>
                <Input
                  value={siteProfileForm.avatarUrl}
                  placeholder="https://..."
                  prefix={<ImageIcon size={15} strokeWidth={3} />}
                  allowClear
                  onChange={(event) => setSiteProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  onClear={() => setSiteProfileForm((current) => ({ ...current, avatarUrl: '' }))}
                />
                <small className="island-admin-field__hint">点击左侧头像可直接上传新头像，也可以从头像库选择历史头像。</small>
              </div>

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
                    placeholder="@biscuit"
                    prefix={<Citrus size={15} strokeWidth={3} />}
                    onChange={(event) => setSiteProfileForm((current) => ({ ...current, handle: event.target.value }))}
                  />
                </label>

                <label className="island-admin-field">
                  <span>小小徽章</span>
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
                    <strong>小小徽章</strong>
                    <small>{siteProfileForm.badgeEnabled ? '正在显示徽章' : '已隐藏徽章'}</small>
                  </span>
                  <Switch size="small" checked={siteProfileForm.badgeEnabled} onChange={(checked) => setSiteProfileForm((current) => ({ ...current, badgeEnabled: checked }))} />
                </div>

                <div className="island-admin-profile-option island-admin-profile-option--select">
                  <span className="island-admin-profile-option__text">
                    <strong>在线状态</strong>
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

      <AdminAvatarLibraryModal
        open={avatarLibraryOpen}
        token={token}
        currentUrl={siteProfileForm.avatarUrl}
        onClose={() => setAvatarLibraryOpen(false)}
        onSelect={(asset) =>
          setSiteProfileForm((current) => ({
            ...current,
            avatarUrl: asset.secureUrl,
          }))
        }
      />
    </section>
  )
}
