import { apiRequest } from './client'

export type TopItemsTimeRange =
  | 'short_term'
  | 'medium_term'
  | 'long_term'

export interface TopArtist {
  rank: number
  spotify_id: string
  name: string
  image_url: string | null
  genres: string[]
  spotify_url: string | null
}

export interface TopArtistsResponse {
  time_range: TopItemsTimeRange
  limit: number
  total: number
  items: TopArtist[]
}

export function getTopArtists(
  timeRange: TopItemsTimeRange = 'medium_term',
  limit = 20,
): Promise<TopArtistsResponse> {
  const query = new URLSearchParams({
    time_range: timeRange,
    limit: String(limit),
  })

  return apiRequest<TopArtistsResponse>(
    `/api/stats/top-artists?${query.toString()}`,
  )
}

export interface TopTrack {
  rank: number
  spotify_id: string
  name: string
  artist_names: string[]
  album_name: string
  album_image_url: string | null
  duration_ms: number
  spotify_url: string | null
}

export interface TopTracksResponse {
  time_range: TopItemsTimeRange
  limit: number
  total: number
  items: TopTrack[]
}

export function getTopTracks(
  timeRange: TopItemsTimeRange = 'medium_term',
  limit = 20,
): Promise<TopTracksResponse> {
  const query = new URLSearchParams({
    time_range: timeRange,
    limit: String(limit),
  })

  return apiRequest<TopTracksResponse>(
    `/api/stats/top-tracks?${query.toString()}`,
  )
}