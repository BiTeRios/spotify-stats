import { apiRequest } from './client'

export interface RecentPlay {
  spotify_id: string
  name: string
  artist_names: string[]
  album_name: string
  album_image_url: string | null
  duration_ms: number
  spotify_url: string | null
  played_at: string
}

export interface RecentHistoryResponse {
  limit: number
  items: RecentPlay[]
}

export function getRecentHistory(
  limit = 50,
): Promise<RecentHistoryResponse> {
  const query = new URLSearchParams({
    limit: String(limit),
  })

  return apiRequest<RecentHistoryResponse>(
    `/api/history/recent?${query.toString()}`,
  )
}