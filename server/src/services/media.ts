import { getEnv } from '../db'
import { HttpError } from '../http'
import { cleanText } from '../utils'

type CloudinaryResourceType = 'image' | 'video' | 'auto'

type CloudinaryUploadPurpose = 'avatar' | 'post-image' | 'post-video'

type CloudinarySignatureInput = {
  purpose?: unknown
  resourceType?: unknown
}

type CloudinaryAssetListInput = CloudinarySignatureInput & {
  nextCursor?: unknown
  maxResults?: unknown
}

type CloudinaryDeleteAssetInput = CloudinarySignatureInput & {
  publicId?: unknown
}

type CloudinaryAdminResource = {
  public_id?: string
  secure_url?: string
  url?: string
  resource_type?: string
  format?: string
  width?: number
  height?: number
  bytes?: number
  created_at?: string
}

type CloudinaryAdminResourcesResponse = {
  resources?: CloudinaryAdminResource[]
  next_cursor?: string
  error?: {
    message?: string
  }
}

type CloudinaryDestroyResponse = {
  result?: string
  error?: {
    message?: string
  }
}

const purposeFolderMap: Record<CloudinaryUploadPurpose, string> = {
  avatar: 'avatars',
  'post-image': 'posts',
  'post-video': 'videos',
}

function normalizePurpose(value: unknown): CloudinaryUploadPurpose {
  const purpose = cleanText(value)

  if (purpose === 'avatar' || purpose === 'post-image' || purpose === 'post-video') return purpose

  return 'post-image'
}

function normalizeResourceType(value: unknown, purpose: CloudinaryUploadPurpose): CloudinaryResourceType {
  const resourceType = cleanText(value)

  if (resourceType === 'image' || resourceType === 'video' || resourceType === 'auto') return resourceType
  if (purpose === 'post-video') return 'video'

  return 'image'
}

function normalizeFolderSegment(value: string) {
  return value
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/')
}

function getUploadFolder(purpose: CloudinaryUploadPurpose) {
  const env = getEnv()
  const baseFolder = normalizeFolderSegment(cleanText(env.CLOUDINARY_UPLOAD_FOLDER) || 'animal-island-blog')
  const purposeFolder = purposeFolderMap[purpose]

  return [baseFolder, purposeFolder].filter(Boolean).join('/')
}

async function sha1Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value))

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function stringifySignatureParams(params: Record<string, string | number | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

export async function createCloudinaryUploadSignature(input: CloudinarySignatureInput) {
  const env = getEnv()
  const cloudName = cleanText(env.CLOUDINARY_CLOUD_NAME)
  const apiKey = cleanText(env.CLOUDINARY_API_KEY)
  const apiSecret = cleanText(env.CLOUDINARY_API_SECRET)

  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(500, '请先配置 Cloudinary 上传环境变量')
  }

  const purpose = normalizePurpose(input.purpose)
  const resourceType = normalizeResourceType(input.resourceType, purpose)
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = getUploadFolder(purpose)
  const paramsToSign = {
    folder,
    timestamp,
  }
  const signaturePayload = stringifySignatureParams(paramsToSign)
  const signature = await sha1Hex(`${signaturePayload}${apiSecret}`)

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
  }
}

export async function listCloudinaryUploadAssets(input: CloudinaryAssetListInput) {
  const env = getEnv()
  const cloudName = cleanText(env.CLOUDINARY_CLOUD_NAME)
  const apiKey = cleanText(env.CLOUDINARY_API_KEY)
  const apiSecret = cleanText(env.CLOUDINARY_API_SECRET)

  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(500, '请先配置 Cloudinary 上传环境变量')
  }

  const purpose = normalizePurpose(input.purpose)
  const resourceType = normalizeResourceType(input.resourceType, purpose)
  const folder = getUploadFolder(purpose)
  const maxResults = Math.min(Math.max(Number(cleanText(input.maxResults)) || 30, 1), 100)
  const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload`)

  url.searchParams.set('prefix', `${folder}/`)
  url.searchParams.set('max_results', String(maxResults))

  const nextCursor = cleanText(input.nextCursor)

  if (nextCursor) {
    url.searchParams.set('next_cursor', nextCursor)
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
    },
  })
  const data = await response.json() as CloudinaryAdminResourcesResponse

  if (!response.ok) {
    throw new HttpError(response.status, data.error?.message || '头像库读取失败')
  }

  return {
    assets: (data.resources ?? [])
      .filter((asset) => asset.secure_url)
      .map((asset) => ({
        publicId: asset.public_id ?? '',
        secureUrl: asset.secure_url ?? '',
        url: asset.url ?? asset.secure_url ?? '',
        resourceType: asset.resource_type ?? resourceType,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        createdAt: asset.created_at,
      })),
    nextCursor: data.next_cursor ?? '',
  }
}

export async function deleteCloudinaryUploadAsset(input: CloudinaryDeleteAssetInput) {
  const env = getEnv()
  const cloudName = cleanText(env.CLOUDINARY_CLOUD_NAME)
  const apiKey = cleanText(env.CLOUDINARY_API_KEY)
  const apiSecret = cleanText(env.CLOUDINARY_API_SECRET)

  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(500, '请先配置 Cloudinary 上传环境变量')
  }

  const purpose = normalizePurpose(input.purpose)
  const resourceType = normalizeResourceType(input.resourceType, purpose)
  const folder = getUploadFolder(purpose)
  const publicId = cleanText(input.publicId)

  if (!publicId) throw new HttpError(400, '缺少要删除的资源 ID')

  if (!publicId.startsWith(`${folder}/`)) {
    throw new HttpError(403, '只能删除当前小岛上传目录里的资源')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const invalidate = 'true'
  const signaturePayload = stringifySignatureParams({
    invalidate,
    public_id: publicId,
    timestamp,
  })
  const signature = await sha1Hex(`${signaturePayload}${apiSecret}`)
  const formData = new FormData()

  formData.set('public_id', publicId)
  formData.set('api_key', apiKey)
  formData.set('timestamp', String(timestamp))
  formData.set('invalidate', invalidate)
  formData.set('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json() as CloudinaryDestroyResponse

  if (!response.ok) {
    throw new HttpError(response.status, data.error?.message || '头像删除失败')
  }

  if (data.result !== 'ok' && data.result !== 'not found') {
    throw new HttpError(422, data.error?.message || '头像删除失败')
  }

  return {
    ok: true,
    publicId,
    result: data.result,
  }
}
