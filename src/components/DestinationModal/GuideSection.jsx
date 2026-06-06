/*
 * Renders individual sections of the AI-generated destination guide.
 * Supports multiple data types (items, text, transport, weather, budget, trinketability).
 */
import './modal.css'

export default function GuideSection({ icon, title, type, data, delay = 0 }) {
  if (!data) return null

  return (
    <section
      className={`guide-section stagger-${delay + 1}`}
      aria-label={title}
    >
      <div className="guide-section-header">
        <span className="guide-section-icon" aria-hidden="true">{icon}</span>
        <h3 className="guide-section-title">{title}</h3>
      </div>

      {type === 'items' && Array.isArray(data) && (
        <div className="guide-item-list">
          {data.map((item, i) => (
            <div key={i} className="guide-item">
              <div className="guide-item-info">
                <div className="guide-item-name">
                  <a 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const query = encodeURIComponent(item.name);
                      window.location.href = `snssdk1233://search?keyword=${query}`;
                      setTimeout(() => window.open(`https://www.tiktok.com/search?q=${query}`, '_blank'), 500);
                    }}
                    style={{ color: 'inherit', textDecoration: 'inherit' }}
                    title="Search on TikTok"
                  >
                    {item.name}
                  </a>
                </div>
                {item.tip && (
                  <div className="guide-item-tip">{item.tip}</div>
                )}
              </div>
              {item.cost && (
                <span className={`guide-item-cost${item.cost.toLowerCase() === 'free' ? ' free' : ''}`}>
                  {item.cost}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {type === 'text' && typeof data === 'string' && (
        <div className="guide-text-block">{data}</div>
      )}

      {type === 'transport' && data && (
        <div className="guide-transport-block">
          <div className="guide-transport-grid" style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
            <div className="guide-transport-stat">
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Distance</div>
              <div style={{ fontWeight: '600' }}>{data.distance || '—'}</div>
            </div>
            <div className="guide-transport-stat">
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Avg Price</div>
              <div style={{ fontWeight: '600' }}>{data.price || '—'}</div>
            </div>
          </div>
          <div className="guide-text-block">{data.summary}</div>
        </div>
      )}

      {type === 'weather' && typeof data === 'string' && (
        <p className="guide-weather-text">{data}</p>
      )}

      {type === 'budget' && data && (
        <div>
          <div className="guide-budget-grid">
            <div className="guide-budget-card">
              <span className="budget-tier">Budget</span>
              <span className="budget-amount">{data.budget || '—'}</span>
              <span className="budget-note">per person/day</span>
            </div>
            <div className="guide-budget-card">
              <span className="budget-tier">Mid-range</span>
              <span className="budget-amount">{data.mid || '—'}</span>
              <span className="budget-note">per person/day</span>
            </div>
          </div>
          {Array.isArray(data.tips) && data.tips.length > 0 && (
            <div className="guide-tips-list" style={{ marginTop: '10px' }}>
              {data.tips.map((tip, i) => (
                <div key={i} className="guide-tip-item">
                  <span className="tip-bullet">→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {type === 'trinketability' && data && (
        <div className="guide-trinket-block">
          <div className="guide-trinket-rating" style={{ fontWeight: '600', marginBottom: '4px' }}>Score: <span className="accent">{data.rating || 'N/A'}</span></div>
          <div className="guide-text-block">{data.summary}</div>
          {Array.isArray(data.notableMentions) && data.notableMentions.length > 0 && (
            <div className="guide-tips-list" style={{ marginTop: '8px' }}>
              {data.notableMentions.map((item, i) => {
                const name = typeof item === 'string' ? item : item.name;
                const desc = typeof item === 'string' ? '' : item.description;
                const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(name)}`;
                
                return (
                  <div key={i} className="guide-tip-item">
                    <span className="tip-bullet">✨</span>
                    <span>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          const query = encodeURIComponent(name);
                          window.location.href = `snssdk1233://search?keyword=${query}`;
                          setTimeout(() => window.open(`https://www.tiktok.com/search?q=${query}`, '_blank'), 500);
                        }}
                        className="trinket-link" 
                        title="Search on TikTok"
                      >
                        {name}
                      </a>
                      {desc ? ` — ${desc}` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
