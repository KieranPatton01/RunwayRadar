/*
 * FlightCard.jsx
 * Renders individual flight details, pricing, and AI rating in a card format.
 * Core responsibility: Displaying flight information and handling save interactions.
 * Dependencies: AppContext for save state.
 */
import { useApp } from '../../context/AppContext.jsx'
import './flightcard.css'

export default function FlightCard({ flight, onClick }) {
  const { isFlightSaved, saveFlightToggle } = useApp()

  const saved   = Boolean(isFlightSaved(flight.id))
  const nights  = typeof flight.nights === 'number' ? flight.nights : null

  const dest    = String(flight.destinationName || flight.destination || '')
  const country = String(flight.destinationCountry || '')
  const flag    = String(flight.destinationFlag || '✈️')

  const depTime  = String(flight.outbound?.departure || '—')
  const depDate  = String(flight.outbound?.date || '')
  const retTime  = String(flight.inbound?.departure || '')
  const retDate  = String(flight.inbound?.date || '')
  const hasReturn = Boolean(flight.inbound)

  const ppPrice    = flight.pricePerPerson ? '£' + String(Math.round(flight.pricePerPerson)) : '—'
  const totalPrice = flight.totalPrice     ? '£' + String(Math.round(flight.totalPrice))     : '—'

  const rating = (typeof flight.aiRating === 'number' && flight.aiRating >= 0) ? Math.round(flight.aiRating) : 3

  const summary = typeof flight.aiSummary === 'string' ? flight.aiSummary : ''

  const bookUrl = 'https://www.ryanair.com/gb/en/trip/flights/select' +
    '?origin='      + encodeURIComponent(String(flight.origin || 'EDI')) +
    '&destination=' + encodeURIComponent(String(flight.destination || '')) +
    '&dateout='     + encodeURIComponent(String(flight.departureDate || flight.outbound?.date || '')) +
    (hasReturn ? '&datein=' + encodeURIComponent(String(flight.inbound?.date || '')) : '') +
    '&tpAdults=2&tpIsRoundTrip=' + (hasReturn ? 'true' : 'false')

  return (
    <article className="flight-card" onClick={onClick}>

      <div className="flight-card-header">
        <div className="flight-card-destination">
          <span className="flight-card-flag">{flag}</span>
          <div>
            <div className="flight-card-city">{dest}</div>
            <div className="flight-card-country">{country}</div>
          </div>
        </div>
        <button
          className={saved ? 'flight-card-save saved' : 'flight-card-save'}
          onClick={function(e) { e.stopPropagation(); saveFlightToggle(flight); }}
        >
          {saved ? '🔖' : '＋'}
        </button>
      </div>

      {nights !== null && (
        <div className="flight-card-nights-badge">
          <span className="nights-number">{nights}</span>
          <span className="nights-label">{' nights'}</span>
          {hasReturn && (
            <span className="nights-dates">{' · ' + depDate + ' → ' + retDate}</span>
          )}
        </div>
      )}

      <div className="flight-card-route">
        <div className="flight-card-leg-inline">
          <span className="leg-inline-label">{'Out'}</span>
          <span className="leg-inline-time">{depTime}</span>
          <span className="leg-inline-date">{depDate}</span>
        </div>
        {hasReturn && (
          <div className="flight-card-leg-inline return">
            <span className="leg-inline-label">{'Ret'}</span>
            <span className="leg-inline-time">{retTime}</span>
            <span className="leg-inline-date">{retDate}</span>
          </div>
        )}
      </div>

      <div className="flight-card-footer">
        <div className="flight-card-pricing">
          <div className="flight-card-total">
            {ppPrice}
            <span className="flight-card-pp-label">{' /pp one-way'}</span>
          </div>
          <div className="flight-card-pp">{totalPrice + ' return total · 2 adults'}</div>
          <div className="flight-card-airline">{'✈ Ryanair'}</div>
        </div>
        <div className={`deal-badge rating-${rating}`}>
          <span className="deal-badge-label">AI Rating: {rating}/5</span>
        </div>
      </div>

      {summary !== '' && (
        <p className="flight-card-ai-summary">{summary}</p>
      )}

<a
  href={bookUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flight-card-book-btn"
  onClick={function(e) { e.stopPropagation(); }}
>
  {'🎟 Book with Ryanair ↗'}
</a>

    </article>
  )
}