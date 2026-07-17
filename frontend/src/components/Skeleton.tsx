interface SkeletonProps {
  className?: string
}

function Skeleton({
  className = '',
}: SkeletonProps) {
  const classes = [
    'skeleton-block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      aria-hidden="true"
    />
  )
}

export default Skeleton