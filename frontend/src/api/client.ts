import { env } from '../config/env'

export class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

function getApiBaseUrl(): string {
  return env.apiBaseUrl.replace(/\/$/, '')
}

async function readErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string
      message?: string
    }

    return data.detail ?? data.message ?? 'The request failed.'
  } catch {
    return 'The request failed.'
  }
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`

  return `${getApiBaseUrl()}${normalizedPath}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response),
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return undefined as T
  }

  return response.json() as Promise<T>
}