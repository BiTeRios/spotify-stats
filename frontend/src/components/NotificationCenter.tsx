import {
  useEffect,
} from 'react'

import type {
  NotificationItem,
  NotificationKind,
} from '../types/notification'

interface NotificationCenterProps {
  notifications: NotificationItem[]
  onDismiss: (notificationId: string) => void
}

interface NotificationCardProps {
  notification: NotificationItem
  onDismiss: (notificationId: string) => void
}

const NOTIFICATION_ICONS: Record<
  NotificationKind,
  string
> = {
  error: '!',
  success: '✓',
  info: 'i',
}

function NotificationCard({
  notification,
  onDismiss,
}: NotificationCardProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(notification.id)
    }, notification.durationMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    notification.durationMs,
    notification.id,
    onDismiss,
  ])

  return (
    <article
      className={`
        app-notification
        app-notification-${notification.kind}
      `}
      role={
        notification.kind === 'error'
          ? 'alert'
          : 'status'
      }
      aria-live={
        notification.kind === 'error'
          ? 'assertive'
          : 'polite'
      }
    >
      <span
        className="app-notification-icon"
        aria-hidden="true"
      >
        {NOTIFICATION_ICONS[notification.kind]}
      </span>

      <div className="app-notification-content">
        <strong>{notification.title}</strong>

        {notification.message && (
          <p>{notification.message}</p>
        )}
      </div>

      <button
        className="app-notification-close"
        type="button"
        aria-label="Dismiss notification"
        onClick={() => {
          onDismiss(notification.id)
        }}
      >
        ×
      </button>
    </article>
  )
}

function NotificationCenter({
  notifications,
  onDismiss,
}: NotificationCenterProps) {
  return (
    <div
      className="app-notification-center"
      aria-label="Application notifications"
    >
      {notifications.map((notification) => (
        <NotificationCard
          notification={notification}
          onDismiss={onDismiss}
          key={notification.id}
        />
      ))}
    </div>
  )
}

export default NotificationCenter