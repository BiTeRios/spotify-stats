import { useEffect, useState } from 'react'


interface ProfileAvatarProps {
  displayName: string | null
  avatarUrl: string | null
}

function getInitials(displayName: string | null): string {
  if (!displayName) {
    return 'S'
  }

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'S'
}

function ProfileAvatar({
  displayName,
  avatarUrl,
}: ProfileAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [avatarUrl])

  const shouldShowImage = avatarUrl && !hasImageError

  if (!shouldShowImage) {
    return (
      <div
        className="profile-avatar profile-avatar-fallback"
        role="img"
        aria-label={
          `${displayName ?? 'Spotify user'} profile placeholder`
        }
      >
        {getInitials(displayName)}
      </div>
    )
  }

  return (
    <img
      className="profile-avatar"
      src={avatarUrl}
      alt={`${displayName ?? 'Spotify user'} profile`}
      onError={() => setHasImageError(true)}
    />
  )
}

export default ProfileAvatar