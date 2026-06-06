/*
 * Connects to Gemini worker endpoints to parse intents, rate deals, and handle chat.
 * Serializes API requests via a single-lane queue.
 * Dependencies: firebase.js (for auth).
 */

import { getIdToken } from './firebase.js'

const WORKER_URL = import.meta.env.VITE_WORKER_URL

class GeminiQueue {
  constructor() {
    this._queue   = []
    this._running = false
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this._queue.push({ fn, resolve, reject })
      this._flush()
    })
  }

  async _flush() {
    if (this._running || this._queue.length === 0) return
    this._running = true
    const { fn, resolve, reject } = this._queue.shift()
    try {
      resolve(await fn())
    } catch (err) {
      reject(err)
    } finally {
      this._running = false
      this._flush()
    }
  }
}

const queue = new GeminiQueue()

async function workerPost(path, body) {
  const token = await getIdToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${WORKER_URL}${path}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Worker error (${res.status})`)
  }

  return res.json()
}

export async function parseSearchIntent(userMessage) {
  return queue.enqueue(async () => {
    const data = await workerPost('/api/parse-intent', { message: userMessage })
    return data.intent
  })
}

export async function rateDeals(flights) {
  return queue.enqueue(async () => {
    const data = await workerPost('/api/rate-deals', { flights })
    return data.ratings
  })
}

export async function getDestinationGuide({ destinationName, destinationCode, tripDays, month, totalPriceGBP }) {
  return queue.enqueue(async () => {
    const data = await workerPost('/api/destination-guide', {
      destinationName, destinationCode, tripDays, month, totalPriceGBP
    })
    return data.guide
  })
}

export async function getChatResponse(userMessage, conversationHistory, context) {
  return queue.enqueue(async () => {
    const data = await workerPost('/api/chat', {
      message: userMessage,
      history: conversationHistory,
      context
    })
    return data.response
  })
}