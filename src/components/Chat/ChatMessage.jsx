/*
 * Renders a single chat message with minimal markdown formatting.
 * Displays user and assistant messages with timestamps.
 */
import './chat.css'

function renderContent(text) {
  if (!text) return null

  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`} className="chat-bubble-line">
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ))
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-bubble">
        {renderContent(message.content)}
      </div>

      <time className="chat-timestamp" dateTime={new Date(message.timestamp).toISOString()}>
        {formatTime(message.timestamp)}
      </time>
    </div>
  )
}
