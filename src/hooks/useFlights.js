/*
 * Orchestrates Ryanair flight search, filtering, and Gemini AI ratings.
 * Exposes flight and filter state for client-side rendering.
 * Dependencies: React, amadeus.js, gemini.js, priceUtils.js, mapbox.js.
 */

import { useState, useCallback, useMemo } from 'react'
import { searchFlights, searchCheapestDestinations } from '../services/amadeus.js'
import { rateDeals } from '../services/gemini.js'
import { calculateLocalDealRating, getDealLabel, getDealEmoji } from '../utils/priceUtils.js'
import { DESTINATION_COORDS } from '../services/mapbox.js'


export const NIGHTS_PRESETS = {
  any:     { label: 'Any',       min: 0,  max: 999 },
  weekend: { label: 'Weekend',   min: 2,  max: 4   },
  short:   { label: 'Short',     min: 4,  max: 7   },
  week:    { label: '~1 week',   min: 5,  max: 9   },
  long:    { label: '10+ days',  min: 10, max: 999  }
}


export const PRICE_CAPS = [
  { label: 'Any',   value: null  },
  { label: '£60',   value: 60    },
  { label: '£100',  value: 100   },
  { label: '£200',  value: 200   },
  { label: '£300',  value: 300   }
]

export function useFlights() {
  const [flights,     setFlights]     = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isRating,    setIsRating]    = useState(false)
  const [error,       setError]       = useState(null)
  const [searchMeta,  setSearchMeta]  = useState(null)


  const [nightsPreset, setNightsPreset] = useState('any')
  const [maxPrice,     setMaxPrice]     = useState(null)


  const filteredFlights = useMemo(() => {
    if (!flights.length) return []
    const { min, max } = NIGHTS_PRESETS[nightsPreset] || NIGHTS_PRESETS.any
    return flights.filter(f => {
      if (f.nights !== null && f.nights !== undefined) {
        if (f.nights < min || f.nights > max) return false
      }
      if (maxPrice !== null && f.totalPrice > maxPrice) return false
      return true
    })
  }, [flights, nightsPreset, maxPrice])

  const setFilters = useCallback(({ nightsPreset: np, maxPrice: mp }) => {
    if (np !== undefined) setNightsPreset(np)
    if (mp !== undefined) setMaxPrice(mp)
  }, [])

  const resetFilters = useCallback(() => {
    setNightsPreset('any')
    setMaxPrice(null)
  }, [])

  const search = useCallback(async (intent) => {
    setIsSearching(true)
    setError(null)
    setFlights([])
    setSearchMeta(intent)
    resetFilters()

    try {
      const dateFrom = intent.dateFrom || getDateFromNow(7)
      const dateTo   = intent.dateTo   || getDateFromNow(45)

      let rawFlights = []
      const targetIATA = intent.targetIATA || intent.destination || 'ANY'

      if (targetIATA && targetIATA !== 'ANY') {
        rawFlights = await searchFlights({
          targetIATA,
          destination: targetIATA,
          dateFrom,
          dateTo,
          maxPrice: intent.maxBudgetGBP || undefined
        })
      } else {
        rawFlights = await searchCheapestDestinations({
          dateFrom,
          dateTo,
          maxPrice: intent.maxBudgetGBP || undefined
        })
      }

      if (rawFlights.length === 0) {
        setFlights([])
        setIsSearching(false)
        return
      }

      const enriched = rawFlights.map(flight => {
        const coords      = DESTINATION_COORDS[flight.destination]
        const localRating = calculateLocalDealRating(flight.pricePerPerson, flight.nights || 3)
        return {
          ...flight,
          destinationName:    coords?.name    || flight.destinationName || flight.destination,
          destinationCountry: coords?.country || flight.destinationCountry || '',
          destinationFlag:    getFlag(coords?.country || flight.destinationCountry),
          aiRating:           localRating,
          aiLabel:            getDealLabel(localRating),
          aiEmoji:            getDealEmoji(localRating),
          aiSummary:          null
        }
      })

      enriched.sort((a, b) => a.totalPrice - b.totalPrice)
      setFlights(enriched)
      setIsSearching(false)

      // Stagger Gemini rating 400ms after results paint
      await wait(400)
      setIsRating(true)
      try {
        const ratings = await rateDeals(enriched)
        if (Array.isArray(ratings) && ratings.length > 0) {
          setFlights(prev =>
            prev.map(flight => {
              const r = ratings.find(x => x.id === flight.id)
              if (!r) return flight
              return {
                ...flight,
                aiRating:  r.dealRating ?? flight.aiRating,
                aiLabel:   r.label      ?? flight.aiLabel,
                aiEmoji:   getDealEmoji(r.dealRating ?? flight.aiRating),
                aiSummary: r.summary    ?? null,
                aiTip:     r.tip        ?? null
              }
            })
          )
        }
      } catch (ratingErr) {
        console.warn('[useFlights] Gemini rating failed:', ratingErr.message)
      } finally {
        setIsRating(false)
      }
    } catch (err) {
      console.error('[useFlights] Search failed:', err.message)
      setError(err.message || 'Flight search failed. Please try again.')
      setIsSearching(false)
      setIsRating(false)
    }
  }, [resetFilters])

  const clearResults = useCallback(() => {
    setFlights([])
    setError(null)
    setSearchMeta(null)
    setIsRating(false)
    resetFilters()
  }, [resetFilters])

  return {
    flights,
    filteredFlights,
    isSearching,
    isRating,
    error,
    searchMeta,
    search,
    clearResults,

    nightsPreset,
    maxPrice,
    setFilters,
    resetFilters,
    activeFilterCount: (nightsPreset !== 'any' ? 1 : 0) + (maxPrice !== null ? 1 : 0)
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getDateFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function getFlag(country) {
  const flags = {
    'Ireland': '🇮🇪', 'Spain': '🇪🇸', 'Portugal': '🇵🇹', 'Italy': '🇮🇹',
    'France': '🇫🇷', 'Germany': '🇩🇪', 'Netherlands': '🇳🇱', 'Poland': '🇵🇱',
    'Hungary': '🇭🇺', 'Czechia': '🇨🇿', 'Austria': '🇦🇹', 'Belgium': '🇧🇪',
    'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Greece': '🇬🇷',
    'Croatia': '🇭🇷', 'Malta': '🇲🇹', 'Bulgaria': '🇧🇬', 'Romania': '🇷🇴',
    'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'Lithuania': '🇱🇹', 'Latvia': '🇱🇻',
    'Estonia': '🇪🇪', 'Finland': '🇫🇮', 'Switzerland': '🇨🇭', 'Morocco': '🇲🇦',
    'United Kingdom': '🇬🇧', 'Cyprus': '🇨🇾'
  }
  return flags[country] || '✈️'
}