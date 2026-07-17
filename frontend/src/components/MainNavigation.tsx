import { useEffect, useState } from 'react'

const NAVIGATION_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
  },
  {
    id: 'now-playing',
    label: 'Now playing',
  },
  {
    id: 'top-artists',
    label: 'Artists',
  },
  {
    id: 'top-tracks',
    label: 'Tracks',
  },
  {
    id: 'history',
    label: 'History',
  },
] as const

function MainNavigation() {
  const [activeSection, setActiveSection] =
    useState('overview')

  useEffect(() => {
    const sections = NAVIGATION_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter(
        (section): section is HTMLElement =>
          section !== null,
      )

    if (sections.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (firstEntry, secondEntry) =>
              secondEntry.intersectionRatio
              - firstEntry.intersectionRatio,
          )[0]

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      },
    )

    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <nav
      className="main-navigation"
      aria-label="Main navigation"
    >
      {NAVIGATION_ITEMS.map((item) => {
        const isActive = activeSection === item.id

        return (
          <a
            className={
              isActive
                ? 'navigation-link navigation-link-active'
                : 'navigation-link'
            }
            href={`#${item.id}`}
            aria-current={
              isActive ? 'location' : undefined
            }
            key={item.id}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

export default MainNavigation