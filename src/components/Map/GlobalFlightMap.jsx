/*
 * GlobalFlightMap.jsx
 * Renders a full-screen interactive flight map with real-time deals.
 * Core responsibility: Fetching and displaying geographical flight deal markers.
 * Dependencies: mapbox-gl, AppContext, Firebase auth.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { getIdToken } from '../../services/firebase.js'
import { useApp } from '../../context/AppContext.jsx'
import './map.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const WORKER_URL   = import.meta.env.VITE_WORKER_URL

import IATA_COORDS from './iata_coords.json'

export default function GlobalFlightMap({ onFlightClick }) {
  const { theme } = useApp()
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0)
  const [mapLoaded, setMapLoaded] = useState(false)

  const getMonthDates = (offsetMonths) => {
    const now = new Date()
    let startDate = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1)
    if (offsetMonths === 0) startDate = now
    const endDate = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0)
    return {
      dateFrom: startDate.toISOString().split('T')[0],
      dateTo: endDate.toISOString().split('T')[0],
      startDate,
      endDate
    }
  }

  const monthOptions = Array.from({ length: 4 }).map((_, i) => {
    const { startDate, endDate } = getMonthDates(i)
    
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    
    const startStr = `${getOrdinal(startDate.getDate())} ${startDate.toLocaleDateString('en-GB', { month: 'short' })}`
    const endStr = `${getOrdinal(endDate.getDate())} ${endDate.toLocaleDateString('en-GB', { month: 'short' })}`

    return {
      label: `${startStr} - ${endStr}`,
      value: i
    }
  })



  const fetchAndRenderDeals = useCallback(async () => {
    if (!mapRef.current || !mapLoaded) return

    setLoading(true)
    setError(null)
    
    try {
      const { dateFrom, dateTo } = getMonthDates(selectedMonthOffset)
      const token = await getIdToken()
      const res = await fetch(`${WORKER_URL}/api/get-global-map-deals?from=EDI&dateFrom=${dateFrom}&dateTo=${dateTo}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const deals = data.deals || []

      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      deals.forEach(deal => {
        const coords = deal.coordinates || IATA_COORDS[deal.iataCode]
        if (!coords) {
          console.warn(`[GlobalMap] Missing coordinates for airport: ${deal.iataCode} (${deal.cityName})`);
          return;
        }

        const el = document.createElement('div')
        el.className = 'price-marker'
        el.innerHTML = `<span class="city-name">${deal.cityName}</span><span class="price-badge">£${deal.price}</span>`
        
        el.addEventListener('click', () => {
          if (onFlightClick && deal.flight) {
            onFlightClick(deal.flight)
          }
        })

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(mapRef.current)
          
        markersRef.current.push(marker)
      })
    } catch (err) {
      console.error('[GlobalMap] Failed to fetch map deals:', err)
      setError('Could not load flights right now.')
    } finally {
      setLoading(false)
    }
  }, [selectedMonthOffset, onFlightClick, mapLoaded])

  useEffect(() => {
    fetchAndRenderDeals()
  }, [fetchAndRenderDeals])



  useEffect(() => {
    if (!MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const getMapStyle = (t) => {
      if (t === 'light') return 'mapbox://styles/mapbox/light-v11'
      if (t === 'pink') return 'mapbox://styles/mapbox/navigation-day-v1'
      return 'mapbox://styles/mapbox/dark-v11'
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: getMapStyle(theme), // Use theme-based style
      center: [10, 48], // Central Europe
      zoom: 3.2,
      pitch: 40,
      projection: 'globe', // Force 3D globe mode for all themes
      attributionControl: false,
      logoPosition: 'bottom-right'
    })

    mapRef.current = map

    map.on('style.load', () => {
      // Add atmosphere effect for the 3D globe
      map.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });
    });

    map.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [theme])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="map-placeholder">
        <p>Add VITE_MAPBOX_TOKEN to .env to enable the Map</p>
      </div>
    )
  }

  return (
    <div className="global-map-wrapper">
      <div ref={containerRef} className="global-map-canvas" />
      
      {loading && (
        <div className="global-map-loading">
          <div className="spinner"></div>
          <span>Finding cheapest flights...</span>
        </div>
      )}
      
      {error && (
        <div className="global-map-error">{error}</div>
      )}
      
      <div className="global-map-top-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100 }}>
        <span>Flights for:</span>
        <select 
          value={selectedMonthOffset} 
          onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            background: 'var(--surface-sunken)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value} style={{ color: 'var(--bg-primary, #000)', background: 'var(--text-primary, #fff)' }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="global-map-overlay">
        <h2>Cheapest Flights from Edinburgh</h2>
        <p>Tap a price to view the flight details.</p>
      </div>
    </div>
  )
}
