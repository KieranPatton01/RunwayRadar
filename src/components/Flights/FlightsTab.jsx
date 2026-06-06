/*
 * FlightsTab.jsx
 * Manages the display of flight search results and saved deals.
 * Core responsibility: Handling search filtering, view switching, and rendering flight lists.
 * Dependencies: useFlights hook, FlightFilters component.
 */
import { useState, useEffect, useRef } from 'react'
import { useFlights } from '../../hooks/useFlights.js'
import FlightCard from '../FlightCard/FlightCard.jsx'
import SavedDeals from '../SavedDeals/SavedDeals.jsx'
import FlightFilters from '../filters/FlightFilters.jsx'
import './flights.css'

export default function FlightsTab({ onFlightClick, onRunSearch }) {
  const [view, setView] = useState('browse') // 'browse' | 'saved'
  const [showFilters, setShowFilters] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const {
    flights,
    filteredFlights,
    isSearching,
    isRating,
    error,
    search,
    nightsPreset,
    maxPrice,
    setFilters,
    resetFilters,
    activeFilterCount
  } = useFlights()

  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1 + (weekOffset * 7))
    const dateFrom = d.toISOString().split('T')[0]
    
    d.setDate(d.getDate() + 6)
    const dateTo = d.toISOString().split('T')[0]

    search({
      targetIATA: 'ANY',
      dateFrom: dateFrom,
      dateTo: dateTo
    })
  }, [weekOffset])

  return (
    <div className="flights-page">
      <div className="flights-header">
        <div className="flights-segmented-control">
          <button 
            className={`segment-btn ${view === 'browse' ? 'active' : ''}`}
            onClick={() => setView('browse')}
          >
            Browse
          </button>
          <button 
            className={`segment-btn ${view === 'saved' ? 'active' : ''}`}
            onClick={() => setView('saved')}
          >
            Saved
          </button>
        </div>
      </div>

      <div className="flights-content">
        {view === 'saved' && (
          <div className="flights-saved-wrapper">
            <SavedDeals onFlightClick={onFlightClick} onRunSearch={onRunSearch} />
          </div>
        )}

        {view === 'browse' && (
          <div className="flights-browse-wrapper">
            
            <div className="flights-filter-row">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="flights-filter-toggle" onClick={() => setShowFilters(true)}>
                  <span className="icon">⚙️</span> Filters
                  {activeFilterCount > 0 && (
                    <span className="filter-badge">{activeFilterCount}</span>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={resetFilters} 
                    style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flights-status-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isSearching ? 'Finding deals...' : `${filteredFlights.length} flights for`}
                <select 
                  value={weekOffset}
                  onChange={(e) => setWeekOffset(Number(e.target.value))}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-sunken)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value={0} style={{ color: 'var(--bg-primary, #000)', background: 'var(--text-primary, #fff)' }}>Next 7 days</option>
                  <option value={1} style={{ color: 'var(--bg-primary, #000)', background: 'var(--text-primary, #fff)' }}>In 1-2 weeks</option>
                  <option value={2} style={{ color: 'var(--bg-primary, #000)', background: 'var(--text-primary, #fff)' }}>In 2-3 weeks</option>
                  <option value={3} style={{ color: 'var(--bg-primary, #000)', background: 'var(--text-primary, #fff)' }}>In 3-4 weeks</option>
                </select>
              </div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 8px 4px', fontStyle: 'italic' }}>
              * These are stitched round-trips from two separate one-way Ryanair fares.
            </p>

            {error && <div className="flights-error">{error}</div>}
            
            <div className="flights-feed">
              {isSearching ? (
                <div className="flights-loading">
                  <div className="spinner"></div>
                  <p>Searching all of Europe...</p>
                </div>
              ) : filteredFlights.length > 0 ? (
                filteredFlights.map(flight => (
                  <FlightCard 
                    key={flight.id}
                    flight={flight}
                    onClick={() => onFlightClick(flight)}
                  />
                ))
              ) : (
                <div className="flights-empty">
                  No flights found matching your filters.
                </div>
              )}
            </div>

            {showFilters && (
              <>
                <div className="bottom-sheet-backdrop" onClick={() => setShowFilters(false)} />
                <div className="bottom-sheet">
                  <div className="bottom-sheet-drag" onClick={() => setShowFilters(false)} />
                  <div className="bottom-sheet-header">
                    <h2>Refine Search</h2>
                    <button className="bottom-sheet-close" onClick={() => setShowFilters(false)}>✕</button>
                  </div>
                  <div className="bottom-sheet-content">
                    <FlightFilters
                      nightsPreset={nightsPreset}
                      maxPrice={maxPrice}
                      totalCount={flights.length}
                      filteredCount={filteredFlights.length}
                      onSetFilters={setFilters}
                      onReset={resetFilters}
                      activeFilterCount={activeFilterCount}
                    />
                  </div>
                  <div className="bottom-sheet-footer">
                    <button className="bottom-sheet-apply" onClick={() => setShowFilters(false)}>
                      Show {filteredFlights.length} Flights
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
