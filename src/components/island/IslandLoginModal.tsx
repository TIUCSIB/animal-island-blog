import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Modal } from 'animal-island-ui'
import { AtSign, KeyRound } from 'lucide-react'

import { emitIslandToast } from './island-toast'
import './island.css'

type TurnstileWidgetId = string

type TurnstileRenderOptions = {
  sitekey: string
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'compact' | 'flexible'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => TurnstileWidgetId
  reset: (widgetId?: TurnstileWidgetId) => void
  remove: (widgetId?: TurnstileWidgetId) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface IslandLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (userName: string, password: string, turnstileToken?: string) => Promise<void> | void
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TURNSTILE_ENABLED = import.meta.env.VITE_ENABLE_TURNSTILE === 'true'
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ''

const TEXT = {
  accountEmpty: '账号和密码不能为空。',
  loginFailed: '登录失败',
  loginFailedDescription: '登录失败。',
  turnstileMissing: '请先完成人机验证。',
  turnstileNotConfigured: '人机验证未配置站点密钥。',
  turnstileFailed: '人机验证失败，请重试。',
  turnstileLoadFailed: '人机验证加载失败，请刷新后重试。',
  accountLabel: '用户名 / 邮箱',
  accountPlaceholder: '岛主用户名 / 邮箱',
  passwordLabel: '密码',
  passwordPlaceholder: '岛主密码',
  submit: '登岛',
  cancel: '游客继续逛',
  title: '小岛通行证',
}

type IslandLoginFormProps = Pick<IslandLoginModalProps, 'onOpenChange' | 'onLogin'>

function IslandLoginForm({ onOpenChange, onLogin }: IslandLoginFormProps) {
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)
  const turnstileErrorHandlerRef = useRef<(() => void) | null>(null)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const turnstileEnabled = TURNSTILE_ENABLED
  const visibleTurnstileError = turnstileEnabled && !TURNSTILE_SITE_KEY ? TEXT.turnstileNotConfigured : turnstileError

  function resetTurnstile() {
    setTurnstileToken('')

    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current)
    }
  }

  useEffect(() => {
    if (!turnstileEnabled) return

    if (!TURNSTILE_SITE_KEY) {
      return
    }

    let cancelled = false

    function renderTurnstile() {
      const container = turnstileContainerRef.current

      if (cancelled || !container || !window.turnstile || turnstileWidgetIdRef.current) return

      turnstileWidgetIdRef.current = window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        size: 'flexible',
        callback: (token) => {
          setTurnstileToken(token)
          setTurnstileError('')
        },
        'expired-callback': () => {
          setTurnstileToken('')
        },
        'error-callback': () => {
          setTurnstileToken('')
          setTurnstileError(TEXT.turnstileFailed)
        },
      })
    }

    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null

    if (window.turnstile) {
      renderTurnstile()
    } else {
      if (!script) {
        script = document.createElement('script')
        script.id = TURNSTILE_SCRIPT_ID
        script.src = TURNSTILE_SCRIPT_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }

      const handleScriptError = () => {
        setTurnstileError(TEXT.turnstileLoadFailed)
      }

      turnstileErrorHandlerRef.current = handleScriptError
      script.addEventListener('load', renderTurnstile)
      script.addEventListener('error', handleScriptError)
    }

    return () => {
      cancelled = true
      script?.removeEventListener('load', renderTurnstile)

      if (script && turnstileErrorHandlerRef.current) {
        script.removeEventListener('error', turnstileErrorHandlerRef.current)
        turnstileErrorHandlerRef.current = null
      }

      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current)
        turnstileWidgetIdRef.current = null
      }
    }
  }, [turnstileEnabled])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!password.trim() || !account.trim()) {
      setErrorMessage(TEXT.accountEmpty)
      emitIslandToast({
        type: 'info',
        title: TEXT.accountEmpty,
      })
      return
    }

    if (turnstileEnabled && !TURNSTILE_SITE_KEY) {
      emitIslandToast({
        type: 'info',
        title: TEXT.turnstileNotConfigured,
      })
      return
    }

    if (turnstileEnabled && !turnstileToken) {
      const message = visibleTurnstileError || TEXT.turnstileMissing

      setTurnstileError(message)
      emitIslandToast({
        type: 'info',
        title: message,
      })
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      await onLogin(account.trim(), password.trim(), turnstileEnabled ? turnstileToken : undefined)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : TEXT.loginFailedDescription

      setErrorMessage(message)
      resetTurnstile()
      emitIslandToast({
        type: 'error',
        title: TEXT.loginFailed,
        description: message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="island-login-modal__form" onSubmit={handleSubmit}>
      <label className="island-login-modal__field">
        <span>{TEXT.accountLabel}</span>
        <Input
          shadow
          value={account}
          size="middle"
          prefix={<AtSign size={15} strokeWidth={3} />}
          allowClear
          placeholder={TEXT.accountPlaceholder}
          onChange={(event) => setAccount(event.target.value)}
          onClear={() => setAccount('')}
        />
      </label>

      <label className="island-login-modal__field">
        <span>{TEXT.passwordLabel}</span>
        <Input
          shadow
          value={password}
          type="password"
          size="middle"
          prefix={<KeyRound size={15} strokeWidth={3} />}
          placeholder={TEXT.passwordPlaceholder}
          onChange={(event) => setPassword(event.target.value)}
          status={errorMessage ? 'error' : undefined}
        />
      </label>

      {turnstileEnabled ?
        <div className="island-login-modal__turnstile">
          <div ref={turnstileContainerRef} />
          {visibleTurnstileError ?
            <small>{visibleTurnstileError}</small>
          : null}
        </div>
      : null}

      <div className="island-login-modal__actions">
        <Button type="primary" htmlType="submit" loading={submitting} block>
          {TEXT.submit}
        </Button>
        <Button type="text" size="small" htmlType="button" block onClick={() => onOpenChange(false)}>
          {TEXT.cancel}
        </Button>
      </div>
    </form>
  )
}

export function IslandLoginModal({ open, onOpenChange, onLogin }: IslandLoginModalProps) {
  return (
    <Modal open={open} title={TEXT.title} width="min(370px, calc(100vw - 28px))" footer={null} maskClosable typewriter={false} className="island-login-modal" onClose={() => onOpenChange(false)}>
      <IslandLoginForm key={open ? 'open' : 'closed'} onOpenChange={onOpenChange} onLogin={onLogin} />
    </Modal>
  )
}
