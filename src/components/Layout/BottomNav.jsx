/*
 * BottomNav.jsx
 * Displays the main bottom navigation bar.
 * Core responsibility: Handling app navigation between primary tabs.
 * Dependencies: AppContext for saved flights count.
 */
import { useApp } from '../../context/AppContext.jsx'
import './layout.css'

const TABS = [
  { id: 'chat',  icon: '💬', label: 'Chat'   },
  { id: 'globe', icon: '🌍', label: 'Explore' },
  { id: 'map',     icon: '🗺️', label: 'Map'     },
  { id: 'flights', icon: '✈️', label: 'Flights' }
]

export default function BottomNav({ activePage, onNavigate }) {
  const { savedFlights } = useApp()

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        {TABS.map(function(tab) {
          const isActive = activePage === tab.id
          return (
            <button
              key={tab.id}
              className={isActive ? 'nav-tab active' : 'nav-tab'}
              onClick={function() { onNavigate(tab.id); }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-tab-icon">
                {tab.id === 'flights' ? (
                  <span className="nav-badge">
                    {tab.icon}
                    {savedFlights?.length > 0 && (
                      <span className="nav-badge-count">{savedFlights.length}</span>
                    )}
                  </span>
                ) : tab.icon}
              </span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}