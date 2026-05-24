import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Modal } from 'animal-island-ui'

import { emitIslandToast } from './island-toast'
import './island.css'

export interface IslandLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (userName: string, password: string) => Promise<void> | void
}

export function IslandLoginModal({ open, onOpenChange, onLogin }: IslandLoginModalProps) {
  const [account, setAccount] = useState('mewbarkjoy')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!password.trim()) {
      const message = '请输入后台密码。'

      setErrorMessage(message)
      emitIslandToast({
        type: 'info',
        title: message,
      })
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      await onLogin(account.trim() || 'mewbarkjoy', password.trim())
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败，请检查后端是否启动。'

      setErrorMessage(message)
      emitIslandToast({
        type: 'error',
        title: '登录失败',
        description: message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title="小岛通行证" width="min(370px, calc(100vw - 28px))" footer={null} maskClosable typewriter={false} className="island-login-modal" onClose={() => onOpenChange(false)}>
      <form className="island-login-modal__form" onSubmit={handleSubmit}>
        <label className="island-login-modal__field">
          <span>用户名 / 邮箱</span>
          <Input shadow value={account} size="middle" prefix="@" allowClear placeholder="mewbarkjoy" onChange={(event) => setAccount(event.target.value)} onClear={() => setAccount('')} />
        </label>

        <label className="island-login-modal__field">
          <span>密码</span>
          <Input shadow value={password} type="password" size="middle" prefix="♡" placeholder="默认 island-admin" onChange={(event) => setPassword(event.target.value)} />
        </label>

        {errorMessage ?
          <p className="island-login-modal__error">{errorMessage}</p>
        : null}

        <div className="island-login-modal__actions">
          <Button type="primary" htmlType="submit" loading={submitting} block>
            登岛
          </Button>
          <Button type="text" size="small" htmlType="button" block onClick={() => onOpenChange(false)}>
            游客继续逛
          </Button>
        </div>
      </form>
    </Modal>
  )
}
