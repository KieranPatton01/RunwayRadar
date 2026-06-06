/*
 * Client-side filter bar shown above flight results.
 * All filtering happens instantly on already-fetched data.
 */
import { NIGHTS_PRESETS, PRICE_CAPS } from '../../hooks/useFlights.js'
import './filters.css'

export default function FlightFilters({
  nightsPreset,
  maxPrice,
  totalCount,
  filteredCount,
  onSetFilters,
  onReset,
  activeFilterCount
}) {
  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="filters-bar">
      <div className="filters-header">
        <span className="filters-title">
          🔍 Filter
          {hasActiveFilters && (
            <span className="filters-active-badge">{activeFilterCount}</span>
          )}
        </span>
        <span className="filters-count">
          {hasActiveFilters
            ? `${filteredCount} of ${totalCount} shown`
            : `${totalCount} results`
          }
        </span>
        {hasActiveFilters && (
          <button className="filters-clear-btn" onClick={onReset} aria-label="Clear all filters">
            Clear all
          </button>
        )}
      </div>

      <div className="filters-section">
        <span className="filters-label">Trip length</span>
        <div className="filters-chips">
          {Object.entries(NIGHTS_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`filter-chip${nightsPreset === key ? ' active' : ''}`}
              onClick={() => onSetFilters({ nightsPreset: key })}
              aria-pressed={nightsPreset === key}
            >
              {preset.label}
              {key !== 'any' && (
                <span className="filter-chip-nights">
                  {key === 'long' ? '10+' : `${preset.min}–${preset.max}`} nights
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-section">
        <span className="filters-label">Max total (2 people)</span>
        <div className="filters-chips">
          {PRICE_CAPS.map(cap => (
            <button
              key={cap.label}
              className={`filter-chip${maxPrice === cap.value ? ' active' : ''}`}
              onClick={() => onSetFilters({ maxPrice: cap.value })}
              aria-pressed={maxPrice === cap.value}
            >
              {cap.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}