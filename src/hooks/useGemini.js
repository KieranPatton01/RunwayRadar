/*
 * Manages chat interactions and parses flight search intents using Gemini.
 * Handles conversational flow and pending search intent resolution.
 * Dependencies: React, gemini.js, aiInstructions.js.
 */

import { useState, useCallback, useRef } from 'react'
import { parseSearchIntent, getChatResponse } from '../services/gemini.js'
import {
  WELCOME_MESSAGE,
  SUGGESTED_PROMPTS,
  SEARCHING_MESSAGES,
  CONFIRMATION_MESSAGES,
  buildResultsMessage
} from '../config/aiInstructions.js'

export { SUGGESTED_PROMPTS }

function makeMsg(role, content, meta = {}) {
  return {
    id:        'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    role,
    content,
    timestamp: new Date(),
    ...meta
  }
}

function welcomeMsg() {
  return { id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE, timestamp: new Date(), type: 'welcome' }
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function useGemini(onSearchIntent) {
  const [messages,   setMessages]   = useState([welcomeMsg()])
  const [isThinking, setIsThinking] = useState(false)
  const [isParsing,  setIsParsing]  = useState(false)


  const pendingIntent = useRef(null)
  const history       = useRef([])

  const addMessage = useCallback((role, content, meta = {}) => {
    const msg = makeMsg(role, content, meta)
    setMessages(prev => [...prev, msg])
    history.current.push({ role, content })
    return msg
  }, [])

  const sendMessage = useCallback(async (userText, currentFlights = []) => {
    if (!userText.trim() || isThinking) return

    addMessage('user', userText)
    setIsThinking(true)
    setIsParsing(true)

    try {
      const isConfirm   = detectConfirmation(userText)
      const isNewSearch = detectNewSearch(userText)


      if (isConfirm && pendingIntent.current) {
        setIsParsing(false)
        addMessage('assistant', randomFrom(CONFIRMATION_MESSAGES), { type: 'confirmation' })
        if (onSearchIntent) onSearchIntent(pendingIntent.current)
        pendingIntent.current = null
        return
      }


      if (currentFlights.length > 0 && !isNewSearch && !isConfirm) {
        setIsParsing(false)
        const response = await getChatResponse(userText, history.current.slice(-6), { flights: currentFlights.slice(0, 5) })
        addMessage('assistant', response, { type: 'chat' })
        return
      }


      const intent = await parseSearchIntent(userText)
      setIsParsing(false)

      if (!intent) {
        addMessage('assistant', "Something went wrong — try again? 🌸", { type: 'error' })
        return
      }


      if (intent.needsMoreInfo || intent.targetIATA === 'NEEDINFO') {
        const question = typeof intent.conversationalResponse === 'string' && intent.conversationalResponse
          ? intent.conversationalResponse
          : "Tell me a bit more — beach or city, and roughly when were you thinking? 🌸"
        addMessage('assistant', question, { type: 'followup' })
        return
      }


      if (intent.readyToSearch === false && intent.conversationalResponse) {
        pendingIntent.current = intent
        addMessage('assistant', intent.conversationalResponse, { type: 'destination_tease', intent })
        return
      }


      if (intent.readyToSearch === true) {
        addMessage('assistant', randomFrom(SEARCHING_MESSAGES), { type: 'searching' })
        pendingIntent.current = null
        if (onSearchIntent) onSearchIntent(intent)
        return
      }


      const response = await getChatResponse(userText, history.current.slice(-6), { flights: currentFlights.slice(0, 5) })
      addMessage('assistant', response, { type: 'chat' })

    } catch (err) {
      console.error('[useGemini]', err)
      addMessage('assistant', `Something went wrong: ${err.message || err}`, { type: 'error' })
    } finally {
      setIsThinking(false)
      setIsParsing(false)
    }
  }, [addMessage, isThinking, onSearchIntent])

  const addResultsMessage = useCallback((count) => {
    addMessage('assistant', buildResultsMessage(count), { type: 'results', count })
  }, [addMessage])

  const clearChat = useCallback(() => {
    setMessages([welcomeMsg()])
    history.current      = []
    pendingIntent.current = null
  }, [])

  return { messages, isThinking, isParsing, sendMessage, addResultsMessage, clearChat }
}

function detectConfirmation(text) {
  const t = text.toLowerCase()
  return ['yes', 'yeah', 'yep', 'go ahead', 'show me', 'find flights', 'check flights',
    'love it', 'love that', 'perfect', 'let\'s do', 'book it', 'sounds perfect',
    'that one', 'definitely', 'absolutely', 'please', 'ok', 'okay'].some(w => t.includes(w))
}

function detectNewSearch(text) {
  const t = text.toLowerCase()
  return ['instead', 'somewhere else', 'different', 'other options', 'what about',
    'try', 'how about', 'look for something'].some(w => t.includes(w))
}