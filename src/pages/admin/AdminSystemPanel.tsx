import type { FormEventHandler } from 'react'
import { Button, Card, Input } from 'animal-island-ui'
import { AtSign, Database, KeyRound, RefreshCw, Server, ShieldCheck } from 'lucide-react'

import type { AdminProfile } from '@/lib/posts-api'
import type { AdminAccountForm, SetAdminAccountForm, SystemCheckItem, SystemCheckStatus } from './types'

type AdminSystemPanelProps = {
  accountForm: AdminAccountForm
  adminProfile: AdminProfile | null
  postsCount: number
  isLoggedIn: boolean
  checkingSystem: boolean
  systemChecks: SystemCheckItem[]
  saving: boolean
  setAccountForm: SetAdminAccountForm
  onCheck: () => void
  onSaveAccount: FormEventHandler<HTMLFormElement>
}

function getCheckClassName(status: SystemCheckStatus) {
  return ['island-admin-check-item', `island-admin-check-item--${status}`].join(' ')
}

export function AdminSystemPanel({ accountForm, adminProfile, postsCount, isLoggedIn, checkingSystem, systemChecks, saving, setAccountForm, onCheck, onSaveAccount }: AdminSystemPanelProps) {
  return (
    <section className="island-admin-panel">
      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">系统管理</span>
            <h2>小岛状态</h2>
          </div>
          <Button type="default" size="small" htmlType="button" icon={<RefreshCw size={14} strokeWidth={3} />} loading={checkingSystem} onClick={onCheck}>
            检查
          </Button>
        </div>

        <div className="island-admin-system-grid">
          <div className="island-admin-system-card">
            <Database aria-hidden="true" size={20} strokeWidth={3} />
            <span>文章数据</span>
            <strong>{postsCount} 条</strong>
          </div>
          <div className="island-admin-system-card">
            <ShieldCheck aria-hidden="true" size={20} strokeWidth={3} />
            <span>登录状态</span>
            <strong>{isLoggedIn ? '已登录' : '未登录'}</strong>
          </div>
          <div className="island-admin-system-card">
            <Server aria-hidden="true" size={20} strokeWidth={3} />
            <span>API</span>
            <strong>/api/health</strong>
          </div>
        </div>

        <div className="island-admin-check-panel">
          <div className="island-admin-check-panel__title">
            <strong>检查结果</strong>
            <span>{systemChecks.length ? '最近一次系统检查结果' : '点击右上角「检查」开始检测'}</span>
          </div>

          {systemChecks.length ? (
            <div className="island-admin-check-list">
              {systemChecks.map((item) => (
                <div key={item.id} className={getCheckClassName(item.status)}>
                  <span className="island-admin-check-item__dot" aria-hidden="true" />
                  <div>
                    <strong>{item.label}</strong>
                    {item.detail ? <small>{item.detail}</small> : null}
                  </div>
                  <em>{item.value}</em>
                </div>
              ))}
            </div>
          ) : (
            <p className="island-admin-check-panel__empty">会检查 API 心跳、文章数据、站点资料、音乐配置和登录 token 是否有效。</p>
          )}
        </div>

        <form className="island-admin-account-form" onSubmit={onSaveAccount}>
          <div className="island-admin-account-form__title">
            <strong>账号安全</strong>
            <span>{adminProfile?.initialized ? '已启用数据库账号登录' : '首次保存后会启用数据库账号登录'}</span>
          </div>

          <label className="island-admin-field">
            <span>账号 / 邮箱</span>
            <Input
              value={accountForm.account}
              placeholder="用户名 或 hello@example.com"
              prefix={<AtSign size={15} strokeWidth={3} />}
              allowClear
              onChange={(event) => setAccountForm((current) => ({ ...current, account: event.target.value }))}
              onClear={() => setAccountForm((current) => ({ ...current, account: '' }))}
            />
          </label>

          <div className="island-admin-account-form__grid">
            <label className="island-admin-field">
              <span>当前密码</span>
              <Input
                type="password"
                value={accountForm.currentPassword}
                placeholder={adminProfile?.initialized ? '当前后台密码' : '默认 island-admin'}
                prefix={<KeyRound size={15} strokeWidth={3} />}
                onChange={(event) => setAccountForm((current) => ({ ...current, currentPassword: event.target.value }))}
              />
            </label>

            <label className="island-admin-field">
              <span>新密码</span>
              <Input
                type="password"
                value={accountForm.newPassword}
                placeholder="不修改可留空"
                prefix={<KeyRound size={15} strokeWidth={3} />}
                onChange={(event) => setAccountForm((current) => ({ ...current, newPassword: event.target.value }))}
              />
            </label>

            <label className="island-admin-field">
              <span>确认新密码</span>
              <Input
                type="password"
                value={accountForm.confirmPassword}
                placeholder="再次输入新密码"
                prefix={<KeyRound size={15} strokeWidth={3} />}
                onChange={(event) => setAccountForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              />
            </label>
          </div>

          <div className="island-admin-system-actions">
            <Button type="primary" htmlType="submit" loading={saving}>
              保存账号
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
