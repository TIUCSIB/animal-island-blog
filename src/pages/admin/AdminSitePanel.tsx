import type { FormEventHandler } from 'react'
import { Button, Card, Input, Select, Switch } from 'animal-island-ui'
import { AtSign, Heart, ImageIcon, MessageCircle, UserRound } from 'lucide-react'

import { IslandAvatar } from '@/components/island'
import type { SetSiteProfileForm, SiteProfileForm } from './types'

const avatarStatusOptions = [
  { key: '', label: '关闭状态' },
  { key: 'online', label: '在线' },
  { key: 'away', label: '离开' },
  { key: 'busy', label: '忙碌' },
]

type AdminSitePanelProps = {
  saving: boolean
  siteProfileForm: SiteProfileForm
  setSiteProfileForm: SetSiteProfileForm
  onSaveSiteProfile: FormEventHandler<HTMLFormElement>
}

export function AdminSitePanel({ saving, siteProfileForm, setSiteProfileForm, onSaveSiteProfile }: AdminSitePanelProps) {
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
    </section>
  )
}
