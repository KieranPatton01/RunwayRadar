/*
 * Full destination guide modal component.
 * Displays map, flight summary, AI travel guide, and booking links.
 */
import { useState, useEffect, useCallback } from 'react'
import DestinationMap from './DestinationMap.jsx'
import GuideSection from './GuideSection.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { getDestinationGuide } from '../../services/gemini.js'
import { formatPrice } from '../../utils/priceUtils.js'
import { formatDate, formatDuration } from '../../utils/dateUtils.js'
import './modal.css'

export default function DestinationModal({ flight, onClose }) {
  const { isFlightSaved, saveFlightToggle } = useApp()
  const [guide, setGuide]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const saved = isFlightSaved(flight.id)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    async function fetchGuide() {
      setLoading(true)
      setError(null)
      try {
        const month = new Date(flight.outbound.date + 'T12:00:00')
          .toLocaleDateString('en-GB', { month: 'long' })

        const result = await getDestinationGuide({
          destinationName: flight.destinationName,
          destinationCode: flight.destination,
          tripDays:        flight.nights || 4,
          month,
          totalPriceGBP:   flight.totalPrice
        })
        setGuide(result)
      } catch (err) {
        console.error('[DestinationModal] Guide fetch failed:', err)
        setError('Could not load the guide right now. Try closing and reopening.')
      } finally {
        setLoading(false)
      }
    }
    fetchGuide()
  }, [flight.id])

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Travel guide for ${flight.destinationName}`}
    >
      <div className="modal-sheet">
        <div className="modal-handle" aria-hidden="true" />

        <DestinationMap
          destinationCode={flight.destination}
          destinationName={flight.destinationName}
        />

        <div className="modal-header">
          <div className="modal-title-area">
            <span className="modal-flag" aria-hidden="true">
              {flight.destinationFlag || '✈️'}
            </span>
            <h2 className="modal-city">{flight.destinationName}</h2>
            <p className="modal-country">{flight.destinationCountry}</p>
          </div>

          <div className="modal-header-actions">
            <button
              className="modal-action-btn"
              onClick={() => saveFlightToggle(flight)}
              aria-label={saved ? 'Remove from saved' : 'Save this flight'}
            >
              {saved ? '🔖 Saved' : '＋ Save'}
            </button>
            <button
              className="modal-action-btn"
              onClick={onClose}
              aria-label="Close guide"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="modal-flight-strip">
          <div className="strip-item">
            <span className="strip-label">Total (2 pax)</span>
            <span className="strip-value accent">{formatPrice(flight.totalPrice)}</span>
          </div>
          <div className="strip-item">
            <span className="strip-label">Per person</span>
            <span className="strip-value">{formatPrice(flight.pricePerPerson)}</span>
          </div>
          <div className="strip-item">
            <span className="strip-label">Nights</span>
            <span className="strip-value">{flight.nights ?? '?'}</span>
          </div>
        </div>

        <div className="modal-dates-row">
          <div className="modal-leg">
            <span className="modal-leg-label">Depart</span>
            <span className="modal-leg-time">{flight.outbound.departure}</span>
            <span className="modal-leg-date">{formatDate(flight.outbound.date)}</span>
            {flight.outbound.durationMins && (
              <span className="modal-leg-dur">
                {formatDuration(flight.outbound.durationMins)} · direct
              </span>
            )}
          </div>

          <div className="modal-route-arrow" aria-hidden="true">✈</div>

          {flight.inbound && (
            <div className="modal-leg modal-leg-return">
              <span className="modal-leg-label">Return</span>
              <span className="modal-leg-time">{flight.inbound.departure}</span>
              <span className="modal-leg-date">{formatDate(flight.inbound.date)}</span>
              {flight.inbound.durationMins && (
                <span className="modal-leg-dur">
                  {formatDuration(flight.inbound.durationMins)} · direct
                </span>
              )}
            </div>
          )}
        </div>

        {flight.bookingLink && (
          <div className="modal-book-row">
            <a
              href={flight.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-book-btn"
              aria-label={`Search this flight on Aviasales — opens in new tab`}
            >
              🎟 Search this flight on Aviasales
              <span className="modal-book-arrow">↗</span>
            </a>
            <p className="modal-book-note">
              Prices are from recent searches — confirm on Aviasales before booking.
            </p>
          </div>
        )}

        <div className="modal-guide">
          {loading && (
            <div className="guide-loading">
              <div className="guide-loading-label">
                <div className="rating-spinner" aria-hidden="true" />
                Generating your travel guide…
              </div>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flight-skeleton">
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line long" />
                  <div className="skeleton skeleton-line med" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="guide-error">
              <p>😔 {error}</p>
            </div>
          )}

          {guide && !loading && (
            <>
              {guide.tagline && (
                <p className="modal-tagline">"{guide.tagline}"</p>
              )}

              <GuideSection icon="☀️" title="Weather"           type="weather" data={guide.weatherSummary}       delay={0} />
              <GuideSection icon="🗺️" title="Top things to do" type="items"   data={guide.topThingsToDo}         delay={1} />
              <GuideSection icon="🍕" title="Food & drink"      type="items"   data={guide.foodRecommendations}   delay={2} />
              <GuideSection icon="🧸" title="Trinketability"    type="trinketability" data={guide.trinketability} delay={3} />
              <GuideSection icon="🌙" title="Nightlife"         type="text"    data={guide.nightlife}             delay={4} />
              <GuideSection icon="🚌" title="Getting around"    type="transport" data={guide.transportTips}         delay={5} />
              <GuideSection icon="💰" title="Daily budget"      type="budget"  data={guide.estimatedDailyBudget}  delay={6} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
