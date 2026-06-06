/*
 * Flight data parsing, formatting utilities, and Ryanair deep-link generation.
 * Dependencies: dateUtils.js.
 */

import { parsePTDuration } from './dateUtils.js'

const AIRLINE_NAMES = {
  FR: 'Ryanair', U2: 'EasyJet', LS: 'Jet2', DY: 'Norwegian',
  W6: 'Wizz Air', BA: 'British Airways', LX: 'Swiss', LH: 'Lufthansa',
  AF: 'Air France', KL: 'KLM', IB: 'Iberia', VY: 'Vueling',
  TP: 'TAP Air Portugal', AY: 'Finnair', SK: 'SAS', EI: 'Aer Lingus'
}

export function getAirlineName(code) {
  return AIRLINE_NAMES[code] || code || '—'
}

export function sortByPrice(flights) {
  return [...flights].sort((a, b) => a.totalPrice - b.totalPrice)
}

export function filterDirectOnly(flights) {
  return flights.filter(f => f.stops === 0)
}



export function buildRyanairDeepLink(origin, destination, date, adults = 2) {
  const params = [
    `origin=${encodeURIComponent(origin)}`,
    `destination=${encodeURIComponent(destination)}`,
    `dateout=${encodeURIComponent(date)}`,
    `tpAdults=${adults}`,
    `tpIsRoundTrip=false`
  ].join('&')

  const webUrl = `https://www.ryanair.com/gb/en/trip/flights/select?${params}`


  const intentUrl = [
    `intent://www.ryanair.com/gb/en/trip/flights/select?${params}`,
    `#Intent`,
    `scheme=https`,
    `package=com.ryanair.activity`,
    `S.browser_fallback_url=${encodeURIComponent(webUrl)}`,
    `end`
  ].join(';')

  const isAndroid = /android/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  )

  return {
    href:   isAndroid ? intentUrl : webUrl,
    webUrl
  }
}

export function normaliseAmadeusOffer(raw) {
  const outboundItinerary = raw.itineraries[0]
  const inboundItinerary  = raw.itineraries[1]
  const outboundSeg       = outboundItinerary.segments[0]
  const inboundSeg        = inboundItinerary?.segments[0]
  const airlineCode       = raw.validatingAirlineCodes?.[0] || outboundSeg.carrierCode

  return {
    id:                 raw.id,
    origin:             outboundSeg.departure.iataCode,
    originName:         'Edinburgh',
    destination:        outboundSeg.arrival.iataCode,
    destinationName:    outboundSeg.arrival.iataCode,
    destinationCountry: '',
    destinationFlag:    '',
    airline:            getAirlineName(airlineCode),
    airlineCode,
    outbound: {
      date:         outboundSeg.departure.at.split('T')[0],
      departure:    outboundSeg.departure.at.split('T')[1]?.substring(0, 5) || '',
      arrival:      outboundSeg.arrival.at.split('T')[1]?.substring(0, 5) || '',
      durationMins: parsePTDuration(outboundItinerary.duration)
    },
    inbound: inboundSeg ? {
      date:         inboundSeg.departure.at.split('T')[0],
      departure:    inboundSeg.departure.at.split('T')[1]?.substring(0, 5) || '',
      arrival:      inboundSeg.arrival.at.split('T')[1]?.substring(0, 5) || '',
      durationMins: parsePTDuration(inboundItinerary.duration)
    } : null,
    totalPrice:     parseFloat(raw.price.grandTotal),
    pricePerPerson: parseFloat(raw.price.grandTotal) / 2,
    currency:       raw.price.currency,
    stops:          outboundItinerary.segments.length - 1
  }
}

export function enrichWithDestinationData(flight, coordsMap) {
  const coords = coordsMap[flight.destination]
  if (!coords) return flight
  return {
    ...flight,
    destinationName:    coords.name,
    destinationCountry: coords.country
  }
}