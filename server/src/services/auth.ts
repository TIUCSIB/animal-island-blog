import { eq } from 'drizzle-orm'

import { ACCESS_TOKEN_MAX_AGE_SECONDS, ADMIN_USER_ID, PASSWORD_HASH_ITERATIONS, REFRESH_TOKEN_MAX_AGE_SECONDS } from '../constants'
import { getAdminPassword, getDb, getEnv } from '../db'
import { adminUsers } from '../db/schema'
import { HttpError } from '../http'
import type { AdminTokenType } from '../types'
import { cleanText, decodeBase64Url, decodeBase64UrlBytes, encodeBase64Url } from '../utils'

type TurnstileSiteVerifyResponse = {
  success?: boolean
  'error-codes'?: string[]
}

type AdminLoginInput = {
  account?: unknown
  password?: unknown
  turnstileToken?: unknown
}

type AdminAccountInput = {
  account?: unknown
  currentPassword?: unknown
  newPassword?: unknown
}

export async function verifyTurnstileToken(token: string, request: Request) {
  if (getEnv().TURNSTILE_ENABLED !== 'true') return

  const secret = cleanText(getEnv().TURNSTILE_SECRET_KEY)

  if (!secret) return

  if (!token) {
    throw new HttpError(400, '请先完成人机验证')
  }

  const formData = new FormData()
  const remoteIp = cleanText(request.headers.get('CF-Connecting-IP')) || cleanText(request.headers.get('x-forwarded-for')?.split(',')[0])

  formData.set('secret', secret)
  formData.set('response', token)

  if (remoteIp) {
    formData.set('remoteip', remoteIp)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new HttpError(502, '人机验证服务暂时不可用')
  }

  const result = await response.json<TurnstileSiteVerifyResponse>()

  if (!result.success) {
    throw new HttpError(403, '人机验证未通过，请重试')
  }
}

async function signTokenPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))

  return encodeBase64Url(signature)
}

async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256,
  )

  return {
    hash: encodeBase64Url(bits),
    salt: encodeBase64Url(salt),
  }
}

async function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const { hash } = await hashPassword(password, decodeBase64UrlBytes(passwordSalt))

  return hash === passwordHash
}

export async function getAdminUser() {
  return getDb().select().from(adminUsers).where(eq(adminUsers.id, ADMIN_USER_ID)).get()
}

export async function getAdminProfile() {
  const user = await getAdminUser()

  return {
    account: user?.account ?? 'mewbarkjoy',
    initialized: Boolean(user),
    updatedAt: user?.updatedAt,
  }
}

async function getAdminTokenSecret() {
  const user = await getAdminUser()

  return user ? `admin-user:${user.id}:${user.passwordHash}:${user.passwordSalt}` : `admin-password:${getAdminPassword()}`
}

async function createAdminToken(type: AdminTokenType, secret: string) {
  const now = Math.floor(Date.now() / 1000)
  const maxAge = type === 'access' ? ACCESS_TOKEN_MAX_AGE_SECONDS : REFRESH_TOKEN_MAX_AGE_SECONDS
  const payload = encodeBase64Url(JSON.stringify({ typ: type, sub: ADMIN_USER_ID, iat: now, exp: now + maxAge }))
  const signature = await signTokenPayload(payload, secret)

  return `${payload}.${signature}`
}

export async function createAdminSession() {
  const secret = await getAdminTokenSecret()
  const accessToken = await createAdminToken('access', secret)
  const refreshToken = await createAdminToken('refresh', secret)

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
    refreshExpiresIn: REFRESH_TOKEN_MAX_AGE_SECONDS,
  }
}

export async function verifyAdminToken(token: string, expectedType: AdminTokenType) {
  const [payload, signature] = token.split('.')

  if (!payload || !signature) return false

  const expectedSignature = await signTokenPayload(payload, await getAdminTokenSecret())

  if (signature !== expectedSignature) return false

  try {
    const data = JSON.parse(decodeBase64Url(payload)) as { exp?: number; typ?: string }
    const typeMatched = data.typ === expectedType || (!data.typ && expectedType === 'access')

    return typeMatched && typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function assertAdmin(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!(await verifyAdminToken(token, 'access'))) {
    throw new HttpError(401, '请先登录后台')
  }
}

export async function loginAdmin(input: AdminLoginInput, request: Request) {
  const account = cleanText(input.account)
  const password = cleanText(input.password)
  const turnstileToken = cleanText(input.turnstileToken)
  const user = await getAdminUser()

  await verifyTurnstileToken(turnstileToken, request)

  if (user) {
    const accountMatched = account.toLowerCase() === user.account.toLowerCase()
    const passwordMatched = await verifyPassword(password, user.passwordHash, user.passwordSalt)

    if (!accountMatched || !passwordMatched) {
      throw new HttpError(401, '账号或密码不正确')
    }
  } else if (password !== getAdminPassword()) {
    throw new HttpError(401, '后台密码不正确')
  }

  return {
    ...(await createAdminSession()),
    profile: user ? { account: user.account, initialized: true, updatedAt: user.updatedAt } : { account: account || 'mewbarkjoy', initialized: false },
  }
}

export async function refreshAdminSession(refreshToken: unknown) {
  const token = cleanText(refreshToken)

  if (!(await verifyAdminToken(token, 'refresh'))) {
    throw new HttpError(401, '登录已过期，请重新登录')
  }

  return {
    ...(await createAdminSession()),
    profile: await getAdminProfile(),
  }
}

export async function updateAdminAccount(input: AdminAccountInput) {
  const account = cleanText(input.account)
  const currentPassword = cleanText(input.currentPassword)
  const newPassword = cleanText(input.newPassword)
  const db = getDb()
  const user = await getAdminUser()

  if (!account) throw new HttpError(400, '请填写账号或邮箱')
  if (!currentPassword) throw new HttpError(400, '请填写当前密码')

  const currentPasswordMatched = user ? await verifyPassword(currentPassword, user.passwordHash, user.passwordSalt) : currentPassword === getAdminPassword()

  if (!currentPasswordMatched) {
    throw new HttpError(401, '当前密码不正确')
  }

  if (newPassword && newPassword.length < 6) {
    throw new HttpError(400, '新密码至少需要 6 位')
  }

  const now = new Date().toISOString()
  const nextPassword = newPassword || currentPassword
  const password = newPassword || !user ? await hashPassword(nextPassword) : { hash: user.passwordHash, salt: user.passwordSalt }

  if (user) {
    await db
      .update(adminUsers)
      .set({
        account,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        updatedAt: now,
      })
      .where(eq(adminUsers.id, ADMIN_USER_ID))
  } else {
    await db.insert(adminUsers).values({
      id: ADMIN_USER_ID,
      account,
      passwordHash: password.hash,
      passwordSalt: password.salt,
      createdAt: now,
      updatedAt: now,
    })
  }

  return getAdminProfile()
}
