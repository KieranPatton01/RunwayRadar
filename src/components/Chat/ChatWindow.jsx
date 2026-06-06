/*
 * Main chat interface container.
 * Displays message history, suggested prompts, and flight search results.
 */
import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage.jsx'
import ChatInput from './ChatInput.jsx'
import FlightCard from '../FlightCard/FlightCard.jsx'
import FlightFilters from '../filters/FlightFilters.jsx'
import { SUGGESTED_PROMPTS, getRandomDestination } from '../../config/aiInstructions.js'
import './chat.css'

export default function ChatWindow({
  messages,
  flights,
  filteredFlights,
  isSearching,
  isRating,
  isThinking,
  onSend,
  onFlightClick,
  onNewSearch,
  nightsPreset,
  maxPrice,
  activeFilterCount,
  onSetFilters,
  onResetFilters
}) {
  const bottomRef   = useRef(null)
  const isFirstMsg  = messages.length === 1

  const safeFlights         = Array.isArray(flights)         ? flights         : []
  const safeFilteredFlights = Array.isArray(filteredFlights) ? filteredFlights : []
  const renderableFlights   = safeFilteredFlights.filter(f => f && typeof f === 'object')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, renderableFlights.length, isSearching])

  function handleSurpriseMe() {
    const dest = getRandomDestination()
    onSend('Tell me about ' + dest.name + ' — what\'s it like for a couple? ' + dest.flag)
  }

  return (
    <div className="chat-page">

      <div className="chat-messages">

        {isFirstMsg && (
          <div className="chat-empty-state">
            <h1 className="chat-empty-title">Where are we going, Tart?</h1>
            <p className="chat-empty-sub">
              Tell me what kind of trip you're dreaming of and I'll help you find the perfect one or I'll break trying perhaps.
            </p>
          </div>
        )}

        {messages.map(function(msg) {
          return <ChatMessage key={msg.id} message={msg} />
        })}

        {isThinking && (
          <div className="chat-message assistant">
            <div className="chat-typing">
              <div className="chat-typing-dots">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
              <span className="chat-typing-label">Sitting... Waiting... Wishing...</span>
            </div>
          </div>
        )}

        {isFirstMsg && (
          <div className="chat-suggestions">
            <button className="surprise-me-btn" onClick={handleSurpriseMe}>
              🎲 Surprise Perhaps
            </button>
            {SUGGESTED_PROMPTS.map(function(prompt) {
              return (
                <button key={prompt} className="suggestion-chip" onClick={function() { onSend(prompt); }}>
                  {prompt}
                </button>
              )
            })}
          </div>
        )}

        {/* Flight results */}
        {(isSearching || safeFlights.length > 0) && (
          <div className="chat-results-section">

            {!isSearching && safeFlights.length > 0 && (
              <>
                <div className="chat-results-header">
                  <div className="chat-results-header-left">
                    <span className="chat-results-title">Ryanair round-trips from Edinburgh</span>
                  </div>
                  {onNewSearch && (
                    <button className="chat-new-search-btn" onClick={onNewSearch}>
                      ↩ New search
                    </button>
                  )}
                </div>

                <FlightFilters
                  nightsPreset={nightsPreset}
                  maxPrice={maxPrice}
                  totalCount={safeFlights.length}
                  filteredCount={renderableFlights.length}
                  onSetFilters={onSetFilters}
                  onReset={onResetFilters}
                  activeFilterCount={activeFilterCount || 0}
                />

                {renderableFlights.length === 0 && (
                  <div className="filters-no-results">
                    Shit: No results match these filters — try widening your trip length or price range.
                  </div>
                )}
              </>
            )}

            {isRating && (
              <div className="rating-notice">
                <div className="rating-spinner" />
                <span>AI is rating deals…</span>
              </div>
            )}

            {isSearching ? (
              [1, 2, 3].map(function(i) {
                return (
                  <div key={i} className="flight-skeleton">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-line long" />
                    <div className="skeleton skeleton-line med" />
                  </div>
                )
              })
            ) : (
              renderableFlights.map(function(flight) {
                return (
                  <FlightCard
                    key={String(flight.id)}
                    flight={flight}
                    onClick={function() { onFlightClick(flight); }}
                  />
                )
              })
            )}

          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={isThinking || isSearching} />
    </div>
  )
}