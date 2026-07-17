import Skeleton from './Skeleton'

function ProfileSkeleton() {
  return (
    <article
      className="
        profile-card
        profile-skeleton
      "
      aria-hidden="true"
    >
      <div className="profile-hero">
        <Skeleton
          className="
            profile-avatar-frame
            skeleton-profile-avatar
          "
        />

        <div
          className="
            profile-heading
            skeleton-profile-heading
          "
        >
          <Skeleton className="skeleton-profile-eyebrow" />
          <Skeleton className="skeleton-profile-title" />
          <Skeleton className="skeleton-profile-subtitle" />
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-details">
          <div className="detail-item">
            <Skeleton className="skeleton-detail-label" />
            <Skeleton className="skeleton-detail-value" />
          </div>

          <div className="detail-item">
            <Skeleton className="skeleton-detail-label" />
            <Skeleton className="skeleton-detail-value" />
          </div>
        </div>

        <div className="profile-actions">
          <Skeleton className="skeleton-profile-button" />
          <Skeleton className="skeleton-profile-button" />
        </div>
      </div>
    </article>
  )
}

export default ProfileSkeleton