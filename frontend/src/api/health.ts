import { env } from '../config/env'

export interface HealthResponse {
  status: string
  service: string
  environment: string
}

export async function getHealth(): Promise<HealthResponse> {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, '')

  const response = await fetch(`${baseUrl}/api/health`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      `Backend returned HTTP status ${response.status}`,
    )
  }

  return response.json() as Promise<HealthResponse>
}