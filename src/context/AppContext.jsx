/*
 * Provides global application state and utilities.
 * Manages authentication, theme preferences, and saved user data via React Context.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { onAuthChange, logout } from '../services/firebase.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setAuthLoading(false)

      // Update the theme-color meta tag for iOS status bar
      const meta = document.getElementById('meta-theme-color')
      if (meta) {
        const style = getComputedStyle(document.documentElement)
        meta.setAttribute('content', style.getPropertyValue('--meta-theme').trim())
      }
    })
    return unsubscribe
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }, [])

  const [theme, setTheme] = useLocalStorage('rr-theme', 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Update iOS status bar colour
    const meta = document.getElementById('meta-theme-color')
    if (meta) {
      const colours = { dark: '#080810', light: '#f4f6fb', pink: '#fdf0f7' }
      meta.setAttribute('content', colours[theme] || '#080810')
    }
  }, [theme])

  const cycleTheme = useCallback(() => {
    const themes = ['dark', 'light', 'pink']
    setTheme(prev => {
      const idx = themes.indexOf(prev)
      return themes[(idx + 1) % themes.length]
    })
  }, [setTheme])

  const [savedFlights, setSavedFlights] = useLocalStorage('rr-saved-flights', [])

  const saveFlightToggle = useCallback((flight) => {
    setSavedFlights(prev => {
      const exists = prev.some(f => f.id === flight.id)
      if (exists) {
        return prev.filter(f => f.id !== flight.id)
      }
      return [{ ...flight, savedAt: new Date().toISOString() }, ...prev]
    })
  }, [setSavedFlights])

  const isFlightSaved = useCallback((flightId) => {
    return savedFlights.some(f => f.id === flightId)
  }, [savedFlights])

  const [savedSearches, setSavedSearches] = useLocalStorage('rr-saved-searches', [])

  const saveSearch = useCallback((query) => {
    setSavedSearches(prev => {
      const exists = prev.find(s => s.query.toLowerCase() === query.toLowerCase())
      if (exists) return prev
      return [{ query, savedAt: new Date().toISOString() }, ...prev.slice(0, 9)]
    })
  }, [setSavedSearches])

  const removeSearch = useCallback((query) => {
    setSavedSearches(prev => prev.filter(s => s.query !== query))
  }, [setSavedSearches])

  return (
    <AppContext.Provider value={{
      user,
      authLoading,
      handleLogout,
      theme,
      cycleTheme,
      savedFlights,
      saveFlightToggle,
      isFlightSaved,
      savedSearches,
      saveSearch,
      removeSearch
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
