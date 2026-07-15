import { env } from '../config/env'

export interface UserProfile {
  spotify_account_id: string
  display_name: string | null
  avatar_url: string | null
  spotify_url: string | null
  subscription: string | null
}

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

async function readErrorMessage(response: Response): Promise<string> {
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

export function getSpotifyLoginUrl(): string {
  return `${getApiBaseUrl()}/api/auth/login`
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await fetch(`${getApiBaseUrl()}/api/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response),
      response.status,
    )
  }

  return response.json() as Promise<UserProfile>
}

export async function logout(): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/auth/logout`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response),
      response.status,
    )
  }
}