/*
 * Flight search service fetching live Ryanair data via Cloudflare Worker.
 * Passes parsed IATA candidate pools to the worker for concurrent searches.
 * Dependencies: firebase.js (for auth).
 */

import { getIdToken } from './firebase.js'

const WORKER_URL = import.meta.env.VITE_WORKER_URL



async function workerGet(path, params = {}) {
  const token = await getIdToken()
  if (!token) throw new Error('Not authenticated')

  // Strip any null, undefined, or empty-string values before building the
  // query string. Sending "dateFrom=null" as a literal string causes the
  // Worker's null-safety checks to see a non-empty value and skip the
  // default-date injection, so we clean them out here at the source.
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 'null')
  )

  const qs  = new URLSearchParams(cleanParams).toString()
  const url = `${WORKER_URL}${path}${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Worker error (${res.status})`)
  }

  return res.json()
}


export async function searchFlights({ destination, targetIATA, dateFrom, dateTo, maxPrice }) {

  const toValue = targetIATA || destination || 'ANY'

  const params = {
    from:     'EDI',
    to:       toValue,
    dateFrom: dateFrom || null,
    dateTo:   dateTo   || null
  }

  if (maxPrice) params.maxPrice = String(Math.round(maxPrice))

  const data = await workerGet('/api/get-ryanair-deals', params)
  return data.flights || []
}


export async function searchCheapestDestinations({ dateFrom, dateTo, maxPrice } = {}) {
  const params = {
    from:     'EDI',
    to:       'ANY',
    dateFrom: dateFrom || null,
    dateTo:   dateTo   || null
  }

  if (maxPrice) params.maxPrice = String(Math.round(maxPrice))

  const data = await workerGet('/api/get-ryanair-deals', params)
  return data.flights || []
}
