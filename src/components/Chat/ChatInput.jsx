/*
 * Chat input textarea with character limit and auto-resize.
 * Handles user message submission.
 */
import { useState, useRef } from 'react'
import './chat.css'

const MAX_CHARS = 300

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const charsLeft    = MAX_CHARS - value.length
  const isNearLimit  = charsLeft <= 50 && charsLeft > 10
  const isAtLimit    = charsLeft <= 10

  function handleInput(e) {
    const next = e.target.value
    if (next.length > MAX_CHARS) return
    setValue(next)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div className="chat-input-bar">
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          className="chat-input-field"
          value={value}
          onInput={handleInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="What Do You Want Stinky? Sun? City Break? …"
          rows={1}
          disabled={disabled}
          aria-label="Chat message input"
          aria-describedby="chat-char-counter"
          autoComplete="off"
          autoCorrect="on"
          spellCheck="true"
          maxLength={MAX_CHARS}
        />
        <button
          className="chat-send-btn"
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>

      {(isNearLimit || isAtLimit) && (
        <div className="chat-input-meta">
          <span
            id="chat-char-counter"
            className={`chat-char-count${isAtLimit ? ' limit' : isNearLimit ? ' warning' : ''}`}
            aria-live="polite"
          >
            {charsLeft} characters left
          </span>
        </div>
      )}
    </div>
  )
}