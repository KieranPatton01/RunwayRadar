/*
 * DealBadge.jsx
 * Displays a color-coded badge representing the AI deal rating for a flight.
 * Core responsibility: Visual indication of deal quality.
 */
import { getDealColour, getDealLabel, getDealEmoji } from '../../utils/priceUtils.js'
import './flightcard.css'

export default function DealBadge({ rating, summary, size = 'normal' }) {
  const colour = getDealColour(rating)
  const label  = getDealLabel(rating)
  const emoji  = getDealEmoji(rating)

  return (
    <div
      className="deal-badge"
      style={{
        backgroundColor: `color-mix(in srgb, ${colour} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${colour} 25%, transparent)`
      }}
      aria-label={`Deal rating: ${label}`}
    >
      <span className="deal-badge-emoji" aria-hidden="true">{emoji}</span>
      <div className="deal-badge-content">
        <span className="deal-badge-label" style={{ color: colour }}>
          {label}
        </span>
        {summary && (
          <span className="deal-badge-summary">{summary}</span>
        )}
      </div>
    </div>
  )
}
