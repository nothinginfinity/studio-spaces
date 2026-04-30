import { useState, useEffect } from 'react'
import { IconMoon, IconSun } from '../ui/Icons'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = sessionStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    sessionStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      className="theme-toggle icon-btn"
      onClick={() => setDark(d => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <IconSun size={15} /> : <IconMoon size={15} />}
    </button>
  )
}
