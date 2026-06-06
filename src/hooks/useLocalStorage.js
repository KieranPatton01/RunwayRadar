/*
 * Generic React hook for persisting state in localStorage.
 * Dependencies: React.
 */

import { useState } from 'react'


export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to read key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {

      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to write key "${key}":`, error)
    }
  }

  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to remove key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
