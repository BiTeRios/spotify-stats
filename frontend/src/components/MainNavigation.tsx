import {
  useEffect,
  useState,
} from 'react'

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

const DESKTOP_NAVIGATION_BREAKPOINT = 860

function MainNavigation() {
  const [activeSection, setActiveSection] =
    useState('overview')

  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    function handleResize() {
      if (
        window.innerWidth
        > DESKTOP_NAVIGATION_BREAKPOINT
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    window.addEventListener(
      'resize',
      handleResize,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      window.removeEventListener(
        'resize',
        handleResize,
      )
    }
  }, [])

  function handleNavigationClick(sectionId: string) {
    setActiveSection(sectionId)
    setIsMenuOpen(false)
  }

  return (
    <div className="navigation-shell">
      <button
        className={
          isMenuOpen
            ? 'menu-toggle menu-toggle-open'
            : 'menu-toggle'
        }
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        aria-label={
          isMenuOpen
            ? 'Close navigation menu'
            : 'Open navigation menu'
        }
        onClick={() => {
          setIsMenuOpen((currentValue) => !currentValue)
        }}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="main-navigation"
        className={
          isMenuOpen
            ? 'main-navigation main-navigation-open'
            : 'main-navigation'
        }
        aria-label="Main navigation"
      >
        {NAVIGATION_ITEMS.map((item) => {
          const isActive =
            activeSection === item.id

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
              onClick={() => {
                handleNavigationClick(item.id)
              }}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

export default MainNavigation