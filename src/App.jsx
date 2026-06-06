/*
 * Main application layout and routing component.
 * Orchestrates navigation between chat, globe, map, and flight views.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from './context/AppContext.jsx'
import Login from './components/Auth/Login.jsx'
import Header from './components/Layout/Header.jsx'
import BottomNav from './components/Layout/BottomNav.jsx'
import ChatWindow from './components/Chat/ChatWindow.jsx'
import FlightsTab from './components/Flights/FlightsTab.jsx'
import Globe from './components/Globe/Globe.jsx'
import GlobalFlightMap from './components/Map/GlobalFlightMap.jsx'
import DestinationModal from './components/DestinationModal/DestinationModal.jsx'
import { useGemini } from './hooks/useGemini.js'
import { useFlights } from './hooks/useFlights.js'
import './App.css'

export default function App() {
  const { user, authLoading, saveSearch } = useApp()

  const [activePage,     setActivePage]     = useState('chat')
  const [selectedFlight, setSelectedFlight] = useState(null)

  const {
    flights,
    filteredFlights,
    isSearching,
    isRating,
    search,
    clearResults,
    nightsPreset,
    maxPrice,
    setFilters,
    resetFilters,
    activeFilterCount
  } = useFlights()

  const wasSearchingRef = useRef(false)

  function handleSearchIntent(intent) {
    if (intent?._rawQuery) saveSearch(intent._rawQuery)
    search(intent)
  }

  const {
    messages,
    isThinking,
    isParsing,
    sendMessage,
    addResultsMessage,
    clearChat
  } = useGemini(handleSearchIntent)

  useEffect(() => {
    if (wasSearchingRef.current && !isSearching) {
      addResultsMessage(flights.length)
    }
    wasSearchingRef.current = isSearching
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching])

  const handleNewSearch = useCallback(() => {
    clearResults()
    clearChat()
    setActivePage('chat')
    setSelectedFlight(null)
  }, [clearResults, clearChat])

  const handleFlightClick = useCallback((flight) => {
    setSelectedFlight(flight)
  }, [])

  const handleModalClose = useCallback(() => {
    setSelectedFlight(null)
  }, [])

  const handleChatAboutCountry = useCallback((countryName) => {
    setActivePage('chat')
    sendMessage('Tell me about ' + countryName + ' — what\'s it like to visit? 🌍', flights)
  }, [sendMessage, flights])

  function handleRunSearch(query) {
    clearResults()
    clearChat()
    setActivePage('chat')
    sendMessage(query, [])
  }

  if (authLoading) {
    return (
      <div className="app-loading">
        <span className="app-loading-text">Loading…</span>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="app-background">
      <Header
        hasResults={flights.length > 0}
        onNewSearch={handleNewSearch}
      />

      <main className={(activePage === 'globe' || activePage === 'map') ? 'main-content page-globe' : 'main-content'}>
        {activePage === 'chat' && (
          <ChatWindow
            messages={messages}
            flights={flights}
            filteredFlights={filteredFlights}
            isSearching={isSearching}
            isRating={isRating}
            isThinking={isThinking || isParsing}
            onSend={function(msg) { sendMessage(msg, flights); }}
            onFlightClick={handleFlightClick}
            onNewSearch={handleNewSearch}
            nightsPreset={nightsPreset}
            maxPrice={maxPrice}
            activeFilterCount={activeFilterCount}
            onSetFilters={setFilters}
            onResetFilters={resetFilters}
          />
        )}

        {activePage === 'globe' && (
          <Globe onChatAboutCountry={handleChatAboutCountry} />
        )}

        {activePage === 'map' && (
          <GlobalFlightMap onFlightClick={handleFlightClick} />
        )}

        {activePage === 'flights' && (
          <FlightsTab
            onFlightClick={handleFlightClick}
            onRunSearch={handleRunSearch}
          />
        )}
      </main>

      <BottomNav activePage={activePage} onNavigate={setActivePage} />

      {selectedFlight && (
        <DestinationModal
          flight={selectedFlight}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}