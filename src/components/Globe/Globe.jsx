/*
 * Globe.jsx
 * Renders a 3D interactive globe using Mapbox GL.
 * Core responsibility: Displaying destinations and handling country selection to fetch Gemini AI guides.
 * Dependencies: mapbox-gl, AppContext, Firebase auth.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { getIdToken } from '../../services/firebase.js'
import { useApp } from '../../context/AppContext.jsx'
import './globe.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const WORKER_URL   = import.meta.env.VITE_WORKER_URL

export default function Globe({ onChatAboutCountry }) {
  const containerRef   = useRef(null)
  const mapRef         = useRef(null)
  const lastHoveredId  = useRef(null)

  const [panel,           setPanel]           = useState(null)    // { countryName }
  const [guide,           setGuide]           = useState(null)    // CountryGuide from Gemini
  const [loadingGuide,    setLoadingGuide]    = useState(false)
  const [guideError,      setGuideError]      = useState(false)

  const { theme } = useApp()



  useEffect(() => {
    if (!MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container:          containerRef.current,
      style:              'mapbox://styles/mapbox/outdoors-v12',
      projection:         'globe',
      center:             [10, 25],
      zoom:               1.4,
      attributionControl: false,
      logoPosition:       'bottom-right'
    })

    mapRef.current = map

    map.on('style.load', () => {
      // Snapchat-style atmosphere
      map.setFog({
        color:            'rgb(180, 210, 240)',
        'high-color':     'rgb(28, 80, 200)',
        'horizon-blend':  0.03,
        'space-color':    'rgb(8, 8, 20)',
        'star-intensity': 0.7
      })

      // Standard GeoJSON layer containing world country boundaries
      map.addSource('country-src', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
        generateId: true // Required for feature-state hover to work!
      })

      // List of countries Ryanair flies to from Edinburgh
      const ryanairCountries = [
        'United Kingdom', 'Ireland', 'France', 'Spain', 'Italy', 'Germany', 'Portugal', 'Greece', 
        'Poland', 'Netherlands', 'Belgium', 'Denmark', 'Norway', 'Sweden', 
        'Finland', 'Croatia', 'Czechia', 'Hungary', 'Malta', 'Cyprus', 'Morocco',
        'Lithuania', 'Latvia', 'Romania', 'Bulgaria', 'Austria', 'Slovakia', 'Albania',
        'Switzerland', 'Bosnia and Herzegovina', 'Turkey', 'Estonia', 'Luxembourg',
        'Republic of Serbia', 'Montenegro'
      ];

      // Safe expression to check if country is in our list
      const isRyanairCountry = ['in', ['coalesce', ['get', 'ADMIN'], ['get', 'name_en'], ['get', 'name'], ''], ['literal', ryanairCountries]];

      // Transparent fill layer for hover + click detection
      map.addLayer({
        id:           'country-fill',
        type:         'fill',
        source:       'country-src',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'rgba(43, 90, 245, 0.7)', // Vibrant blue on hover
            isRyanairCountry,
            'rgba(43, 90, 245, 0.3)', // Soft blue for Ryanair destinations
            'rgba(0, 0, 0, 0)' // Transparent for the rest of the world
          ],
          'fill-opacity': 1
        }
      })

      // Subtle outline on hover
      map.addLayer({
        id:           'country-outline',
        type:         'line',
        source:       'country-src',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'rgba(43, 90, 245, 1)', // Bright solid blue border on hover
            isRyanairCountry,
            'rgba(43, 90, 245, 0.6)', // Visible border for Ryanair destinations
            'rgba(0, 0, 0, 0)'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            1
          ]
        }
      })



      map.on('mousemove', 'country-fill', (e) => {
        if (!e.features?.length) return
        map.getCanvas().style.cursor = 'pointer'

        if (lastHoveredId.current !== null) {
          map.setFeatureState(
            { source: 'country-src', id: lastHoveredId.current },
            { hover: false }
          )
        }
        
        // GeoJSON features might not have a reliable string ID, but mapbox assigns numeric IDs if possible.
        // We can just use the feature ID if it exists, otherwise fall back to string index.
        const featId = e.features[0].id ?? e.features[0].properties.ADMIN ?? e.features[0].properties.ISO_A3;
        
        lastHoveredId.current = featId
        map.setFeatureState(
          { source: 'country-src', id: lastHoveredId.current },
          { hover: true }
        )
      })

      map.on('mouseleave', 'country-fill', () => {
        map.getCanvas().style.cursor = ''
        if (lastHoveredId.current !== null) {
          map.setFeatureState(
            { source: 'country-src', id: lastHoveredId.current },
            { hover: false }
          )
          lastHoveredId.current = null
        }
      })



      map.on('click', 'country-fill', (e) => {
        if (!e.features?.length) return
        const props       = e.features[0].properties
        const countryName = props.ADMIN || props.name_en || props.name || 'this country'
        openCountryPanel(countryName)
      })
    })



    map.on('load', () => {
      map.flyTo({
        center: [15, 50], // Coordinates for Europe
        zoom: 3.5,
        duration: 2500,
        essential: true
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])



  const openCountryPanel = useCallback(async (countryName) => {
    setPanel({ countryName })
    setGuide(null)
    setGuideError(false)
    setLoadingGuide(true)

    try {
      const token = await getIdToken()
      const res   = await fetch(WORKER_URL + '/api/country-guide', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ countryName })
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      setGuide(data.guide)
    } catch (err) {
      console.error('[Globe] Country guide error:', err)
      setGuideError(true)
    } finally {
      setLoadingGuide(false)
    }
  }, [])

  function closePanel() {
    setPanel(null)
    setGuide(null)
    setGuideError(false)
  }

  function handleChatAbout() {
    if (panel?.countryName && onChatAboutCountry) {
      onChatAboutCountry(panel.countryName)
    }
    closePanel()
  }



  if (!MAPBOX_TOKEN) {
    return (
      <div className="globe-placeholder">
        <span className="globe-placeholder-icon">🌍</span>
        <p className="globe-placeholder-text">Add VITE_MAPBOX_TOKEN to .env to enable the globe</p>
      </div>
    )
  }

  return (
    <div className="globe-wrapper">
      <div ref={containerRef} className="globe-canvas" />

      <div className="globe-hint">✨ Tap any country to explore</div>


      {panel && (
        <div className="globe-panel" role="dialog" aria-label={'Explore ' + panel.countryName}>
          <div className="globe-panel-drag" onClick={closePanel} />

          <div className="globe-panel-header">
            <div className="globe-panel-title">
              {guide?.emoji && <span className="globe-panel-flag">{guide.emoji}</span>}
              <span className="globe-panel-country">{panel.countryName}</span>
            </div>
            <button className="globe-panel-close" onClick={closePanel} aria-label="Close">✕</button>
          </div>

          {loadingGuide && (
            <div className="globe-panel-loading">
              <div className="globe-spinner" />
              <span>Loading guide...</span>
            </div>
          )}

          {guideError && (
            <div className="globe-panel-error">
              Couldn't load info for {panel.countryName} — tap to try again.
            </div>
          )}

          {guide && (
            <div className="globe-panel-content">
              <p className="globe-panel-headline">{guide.headline}</p>
              <p className="globe-panel-overview">{guide.overview}</p>

              {guide.topCities?.length > 0 && (
                <div className="globe-cities">
                  <div className="globe-section-label">Top cities</div>
                  {guide.topCities.map(city => (
                    <div key={city.name} className="globe-city-card">
                      <div className="globe-city-name">
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            const query = encodeURIComponent(city.name + ' ' + panel.countryName);
                            window.location.href = `snssdk1233://search?keyword=${query}`;
                            setTimeout(() => window.open(`https://www.tiktok.com/search?q=${query}`, '_blank'), 500);
                          }}
                          style={{ color: 'inherit', textDecoration: 'inherit' }}
                          title="Search on TikTok"
                        >
                          {city.name}
                        </a>
                      </div>
                      <div className="globe-city-vibe">{city.vibe}</div>
                      <div className="globe-city-highlight">{city.highlight}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="globe-panel-meta">
                {guide.bestFor && (
                  <div className="globe-meta-chip">
                    <span className="globe-meta-label">Best for</span>
                    <span className="globe-meta-value">{guide.bestFor}</span>
                  </div>
                )}
                {guide.bestMonths && (
                  <div className="globe-meta-chip">
                    <span className="globe-meta-label">Best time</span>
                    <span className="globe-meta-value">{guide.bestMonths}</span>
                  </div>
                )}
                {guide.ryanairFromEdinburgh !== undefined && (
                  <div className="globe-meta-chip">
                    <span className="globe-meta-label">Ryanair from EDI</span>
                    <span className="globe-meta-value">
                      {guide.ryanairFromEdinburgh ? '✅ Yes' : '❌ Not direct'}
                    </span>
                  </div>
                )}
              </div>

              {guide.quickTips?.length > 0 && (
                <div className="globe-tips">
                  <div className="globe-section-label">Quick tips</div>
                  {guide.quickTips.map((tip, i) => (
                    <div key={i} className="globe-tip">💡 {tip}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="globe-panel-cta" onClick={handleChatAbout}>
            💬 Chat with RunwayRadar about {panel.countryName}
          </button>
        </div>
      )}
    </div>
  )
}   