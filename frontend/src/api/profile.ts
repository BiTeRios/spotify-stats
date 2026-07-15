import { apiRequest, getApiUrl } from './client'

export { ApiRequestError } from './client'

export interface UserProfile {
  spotify_account_id: string
  display_name: string | null
  avatar_url: string | null
  spotify_url: string | null
  subscription: string | null
}

export function getSpotifyLoginUrl(): string {
  return getApiUrl('/api/auth/login')
}

export function getMyProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/me')
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  })
}