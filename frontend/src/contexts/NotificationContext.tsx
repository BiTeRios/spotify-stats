import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import NotificationCenter from '../components/NotificationCenter'

import type {
  NotificationInput,
  NotificationItem,
} from '../types/notification'

const DEFAULT_DURATION_MS = 6_000
const MAX_VISIBLE_NOTIFICATIONS = 4

interface NotificationContextValue {
  showNotification: (
    notification: NotificationInput,
  ) => void

  dismissNotification: (
    notificationId: string,
  ) => void
}

interface NotificationProviderProps {
  children: ReactNode
}

const NotificationContext =
  createContext<NotificationContextValue | null>(null)

function createNotificationId(): string {
  return [
    Date.now(),
    Math.random().toString(36).slice(2),
  ].join('-')
}

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([])

  const dismissNotification = useCallback(
    (notificationId: string) => {
      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            notification.id !== notificationId,
        ),
      )
    },
    [],
  )

  const showNotification = useCallback(
    (input: NotificationInput) => {
      const notification: NotificationItem = {
        id: createNotificationId(),
        kind: input.kind ?? 'error',
        title: input.title,
        message: input.message,
        durationMs:
          input.durationMs ?? DEFAULT_DURATION_MS,
        dedupeKey: input.dedupeKey,
      }

      setNotifications((currentNotifications) => {
        const duplicateExists =
          notification.dedupeKey !== undefined
          && currentNotifications.some(
            (currentNotification) =>
              currentNotification.dedupeKey
              === notification.dedupeKey,
          )

        if (duplicateExists) {
          return currentNotifications
        }

        return [
          ...currentNotifications,
          notification,
        ].slice(-MAX_VISIBLE_NOTIFICATIONS)
      })
    },
    [],
  )

  const contextValue = useMemo(
    () => ({
      showNotification,
      dismissNotification,
    }),
    [
      dismissNotification,
      showNotification,
    ],
  )

  return (
    <NotificationContext.Provider
      value={contextValue}
    >
      {children}

      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </NotificationContext.Provider>
  )
}

export function useNotifications():
  NotificationContextValue {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error(
      'useNotifications must be used inside NotificationProvider.',
    )
  }

  return context
}