/*
 * SavedDeals.jsx
 * Displays the user's saved flights and recent searches.
 * Core responsibility: Managing saved items interface and allowing quick re-searches.
 * Dependencies: AppContext, FlightCard component.
 */
import { useApp } from '../../context/AppContext.jsx'
import FlightCard from '../FlightCard/FlightCard.jsx'
import './saved.css'

export default function SavedDeals({ onFlightClick, onRunSearch }) {
  const {
    savedFlights,
    savedSearches,
    removeSearch
  } = useApp()

  const hasAnything = savedFlights.length > 0 || savedSearches.length > 0

  if (!hasAnything) {
    return (
      <div className="saved-page">
        <div className="saved-empty">
          <span className="saved-empty-icon">🔖</span>
          <h2 className="saved-empty-title">Nothing saved yet</h2>
          <p className="saved-empty-sub">
            Search for flights and tap <strong>＋</strong> on any card to save it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="saved-page">
      <div className="saved-page-header">
        <p className="saved-page-sub">Your saved flights and searches</p>
      </div>


      {savedFlights.length > 0 && (
        <div>
          <p className="saved-section-label">Saved flights ({savedFlights.length})</p>
          <div className="saved-flights-list">
            {savedFlights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onClick={() => onFlightClick(flight)}
              />
            ))}
          </div>
        </div>
      )}


      {savedSearches.length > 0 && (
        <div>
          <p className="saved-section-label">Recent searches</p>
          <div className="saved-searches-list">
            {savedSearches.map(search => (
              <div key={search.query} className="saved-search-item">
                <span className="saved-search-text">🔍 {search.query}</span>
                <div className="saved-search-actions">
                  <button
                    className="saved-search-run"
                    onClick={() => onRunSearch(search.query)}
                    aria-label={`Search again for "${search.query}"`}
                  >
                    Search again
                  </button>
                  <button
                    className="saved-search-remove"
                    onClick={() => removeSearch(search.query)}
                    aria-label={`Remove "${search.query}"`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
