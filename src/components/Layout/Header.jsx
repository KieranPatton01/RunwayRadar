/*
 * Header.jsx
 * Displays the application top bar.
 * Core responsibility: Rendering the logo, theme toggle, new search action, and user menu.
 * Dependencies: AppContext for theme and user state.
 */
import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import './layout.css'

const THEME_ICONS  = { dark: '🌙', light: '☀️', pink: '🌸' }
const THEME_LABELS = { dark: 'Dark', light: 'Light', pink: 'Pink' }
const THEME_NEXT   = { dark: 'light', light: 'pink', pink: 'dark' }

export default function Header({ hasResults, onNewSearch }) {
  const { user, handleLogout, theme, cycleTheme } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)


  useEffect(() => {
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onOutside)
      document.addEventListener('touchstart', onOutside)
    }
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [menuOpen])

  function handleLogoutClick() {
    setMenuOpen(false)
    handleLogout()
  }

  return (
    <header className="header">
      <div className="header-inner">


        <a href="#" className="header-logo" aria-label="RunwayRadar home">
          <span className="header-logo-text">
            Runway<span>Radar</span>
          </span>
        </a>


        <div className="header-actions">


          {hasResults && onNewSearch && (
            <button
              className="header-new-search-btn"
              onClick={onNewSearch}
              aria-label="Start a new search"
            >
              ↩ New search
            </button>
          )}


          <button
            className="header-btn"
            onClick={cycleTheme}
            title={`Switch to ${THEME_LABELS[THEME_NEXT[theme]]} theme`}
            aria-label={`Theme: ${THEME_LABELS[theme]}. Click for ${THEME_LABELS[THEME_NEXT[theme]]}`}
          >
            {THEME_ICONS[theme]}
          </button>


          <div className="header-user-menu" ref={menuRef}>
            <button
              className="header-btn"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              👤
            </button>

            {menuOpen && (
              <div className="user-dropdown" role="menu">
                <div className="user-dropdown-email" title={user?.email}>
                  {user?.email}
                </div>
                <button
                  className="user-dropdown-item danger"
                  onClick={handleLogoutClick}
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
