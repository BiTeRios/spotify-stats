export function formatDuration(
  durationMs: number,
): string {
  const safeDurationMs = Number.isFinite(durationMs)
    ? Math.max(0, durationMs)
    : 0

  const totalSeconds = Math.floor(
    safeDurationMs / 1000,
  )

  const minutes = Math.floor(
    totalSeconds / 60,
  )

  const seconds = totalSeconds % 60

  return `${minutes}:${seconds
    .toString()
    .padStart(2, '0')}`
}