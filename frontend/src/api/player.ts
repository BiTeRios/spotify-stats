import { apiRequest } from './client'

export interface CurrentTrack {
  spotify_id: string
  name: string
  artist_names: string[]
  album_name: string
  album_image_url: string | null
  duration_ms: number
  spotify_url: string | null
}

export interface CurrentPlaybackResponse {
  is_active: boolean
  is_playing: boolean
  progress_ms: number | null
  track: CurrentTrack | null
}

export function getCurrentPlayback(
  signal?: AbortSignal,
): Promise<CurrentPlaybackResponse> {
  return apiRequest<CurrentPlaybackResponse>(
    '/api/player/current',
    { signal },
  )
}