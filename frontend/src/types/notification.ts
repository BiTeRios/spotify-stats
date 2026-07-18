export type NotificationKind =
  | 'error'
  | 'success'
  | 'info'

export interface NotificationInput {
  kind?: NotificationKind
  title: string
  message?: string
  durationMs?: number
  dedupeKey?: string
}

export interface NotificationItem {
  id: string
  kind: NotificationKind
  title: string
  message?: string
  durationMs: number
  dedupeKey?: string
}