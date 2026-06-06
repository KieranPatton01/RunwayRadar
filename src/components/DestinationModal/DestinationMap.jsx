/*
 * Renders a Mapbox GL map for the destination.
 * Attribution and logo are hidden via CSS.
 */
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN, getCoordsForDestination, getMapStyle } from '../../services/mapbox.js'
import { useApp } from '../../context/AppContext.jsx'
import './modal.css'

export default function DestinationMap({ destinationCode, destinationName }) {
  const mapContainerRef = useRef(null)
  const mapRef          = useRef(null)
  const markerRef       = useRef(null)
  const { theme }       = useApp()

  useEffect(() => {
    // Show placeholder if Mapbox token hasn't been set yet
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'REPLACE_WITH_YOUR_MAPBOX_TOKEN') {
      console.warn('[DestinationMap] Mapbox token not set — showing placeholder')
      return
    }

    const coords = getCoordsForDestination(destinationCode)
    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container:          mapContainerRef.current,
      style:              getMapStyle(theme),
      center:             [coords.lng, coords.lat],
      zoom:               10,
      interactive:        false,
      attributionControl: false,
      logoPosition:       'bottom-left'
    })

    mapRef.current = map

    map.on('load', () => {
      const el = document.createElement('div')
      el.className = 'modal-map-pin'

      markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map)
    })

    return () => {
      markerRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [destinationCode])

  // Update map style when theme changes without recreating the whole map
  useEffect(() => {
    if (!mapRef.current || !MAPBOX_TOKEN || MAPBOX_TOKEN === 'REPLACE_WITH_YOUR_MAPBOX_TOKEN') return
    
    const updateStyle = () => {
      mapRef.current.setStyle(getMapStyle(theme))
    }

    // Only set style if the map has finished its initial load, otherwise wait for it.
    if (mapRef.current.isStyleLoaded()) {
      updateStyle()
    } else {
      mapRef.current.once('style.load', updateStyle)
    }
  }, [theme])

  // Placeholder shown when token is missing
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'REPLACE_WITH_YOUR_MAPBOX_TOKEN') {
    return (
      <div className="modal-map-container modal-map-placeholder" aria-label={`Map of ${destinationName}`}>
        <span className="modal-map-placeholder-icon">🗺️</span>
        <span className="modal-map-placeholder-text">Map — add Mapbox token to .env</span>
      </div>
    )
  }

  return (
    <div className="modal-map-container" aria-label={`Map of ${destinationName}`}>
      <div ref={mapContainerRef} className="modal-map" />
    </div>
  )
}
