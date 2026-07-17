export interface FormattedPlayedAt {
  date: string
  time: string
}

export function getUserTimeZone(): string {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone
      || 'UTC'
    )
  } catch {
    return 'UTC'
  }
}

export function formatTimeZoneLabel(
  timeZone: string,
): string {
  return timeZone.replace(/_/g, ' ')
}

function formatInTimeZone(
  playedAtDate: Date,
  timeZone: string,
): FormattedPlayedAt {
  const dateFormatter = new Intl.DateTimeFormat(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone,
    },
  )

  const timeFormatter = new Intl.DateTimeFormat(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
      timeZoneName: 'short',
    },
  )

  return {
    date: dateFormatter.format(playedAtDate),
    time: timeFormatter.format(playedAtDate),
  }
}

export function formatPlayedAt(
  playedAt: string,
  timeZone = getUserTimeZone(),
): FormattedPlayedAt {
  const playedAtDate = new Date(playedAt)

  if (Number.isNaN(playedAtDate.getTime())) {
    return {
      date: 'Unknown date',
      time: 'Unknown time',
    }
  }

  try {
    return formatInTimeZone(
      playedAtDate,
      timeZone,
    )
  } catch {
    return formatInTimeZone(
      playedAtDate,
      'UTC',
    )
  }
}