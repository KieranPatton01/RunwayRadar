/*
 * worker/index.js
 * Entry point for the Cloudflare Worker API.
 * Handles routing, rate limiting, Ryanair flight fetching, and AI integration.
 */
import {
  CORE_PERSONA,
  buildParseIntentPrompt,
  buildRateDealsPrompt,
  buildDestinationGuidePrompt,
  buildCountryGuidePrompt,
  buildChatSystemInstruction,
  buildChatPrompt
} from './prompts.js'

const POOL_SIZE       = 30;
const RESULT_CAP      = 30;
const MAX_CANDIDATES  = 4;
const DATE_BLOCK_DAYS = 30;
const RYANAIR_LIMIT   = 150;

const GEMINI_MODELS_STANDARD  = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const GEMINI_MODELS_LITE_ONLY = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
const GEMINI_MODELS_FAST      = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

const RYANAIR_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept':          'application/json, text/plain, */*',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Referer':         'https://www.ryanair.com/gb/en',
  'Origin':          'https://www.ryanair.com'
};



export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse(new Response(null, { status: 204 }), env);
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    try {
      const user = await verifyFirebaseToken(request, env);
      if (!user) return corsResponse(json({ error: 'Unauthorized' }, 401), env);

      // Apply rate limit (max 50 requests per minute per user)
      if (!checkRateLimit(user.email)) {
        console.warn(`[RateLimit] User ${user.email} exceeded 50 req/min.`);
        return corsResponse(json({ error: 'Rate limit exceeded. Please wait a minute before trying again.' }, 429), env);
      }

      if (path === '/api/get-ryanair-deals' && request.method === 'GET')  return corsResponse(await handleRyanairDeals(url, env), env);
      if (path === '/api/get-global-map-deals' && request.method === 'GET') return corsResponse(await handleGlobalMapDeals(url, env), env);
      if (path === '/api/parse-intent'      && request.method === 'POST') return corsResponse(await handleParseIntent(request, env), env);
      if (path === '/api/rate-deals'        && request.method === 'POST') return corsResponse(await handleRateDeals(request, env), env);
      if (path === '/api/destination-guide' && request.method === 'POST') return corsResponse(await handleDestinationGuide(request, env), env);
      if (path === '/api/country-guide'     && request.method === 'POST') return corsResponse(await handleCountryGuide(request, env), env);
      if (path === '/api/chat'              && request.method === 'POST') return corsResponse(await handleChat(request, env), env);

      return corsResponse(json({ error: 'Not found' }, 404), env);
    } catch (err) {
      console.error('[Worker] Unhandled error:', err.message);
      return corsResponse(json({ error: err.message || 'Internal error' }, 500), env);
    }
  }
};



const rateLimitMap = new Map();

function checkRateLimit(email) {
  if (!email) return true; // fallback
  const now = Date.now();
  const LIMIT = 50; // Requests per minute
  const WINDOW_MS = 60000;
  
  let record = rateLimitMap.get(email);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  
  if (record.count >= LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}



function sanitiseInput(raw, maxLen = 400) {
  if (raw === null || raw === undefined) return '';
  return String(raw).substring(0, maxLen).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

function sanitiseForPrompt(raw, maxLen = 300) {
  return sanitiseInput(raw, maxLen)
    .replace(/`/g, "'")
    .replace(/\$\{/g, '$(')
    .replace(/\\/g, '/');
}

function safeInt(val, fallback = 0, min = 0, max = 999999) {
  const n = parseInt(val, 10);
  if (!isFinite(n) || n < min || n > max) return fallback;
  return n;
}

async function readBody(request, maxBytes = 50000) {
  const cl = parseInt(request.headers.get('content-length') || '0', 10);
  if (cl > maxBytes) throw Object.assign(new Error('Request body too large'), { status: 413 });
  const text = await request.text();
  if (text.length > maxBytes) throw Object.assign(new Error('Request body too large'), { status: 413 });
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('Invalid JSON body'), { status: 400 });
  }
}

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out after ' + ms + 'ms');
    throw err;
  } finally {
    clearTimeout(id);
  }
}



async function verifyFirebaseToken(request, env) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (!token || token.length < 20 || token.length > 4096) return null;

  const allowed = (env.ALLOWED_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

  if (allowed.length === 0) {
    console.error('[Auth] ALLOWED_EMAILS not configured — denying all');
    return null;
  }

  try {
    const res = await fetchWithTimeout(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + env.FIREBASE_WEB_API_KEY,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken: token })
      },
      8000
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.users?.length) return null;

    const user = data.users[0];
    if (!allowed.includes(user.email?.toLowerCase())) {
      console.warn('[Auth] Blocked:', user.email);
      return null;
    }

    return user;
  } catch (err) {
    console.error('[Auth] Failed:', err.message);
    return null;
  }
}



function todayStr() {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${days[d.getDay()]}, ${d.toISOString().split('T')[0]}`;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function addDaysToDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Split date range into blocks of blockDays days.
// 30-day blocks = far fewer subrequests than 7-day chunks.
// e.g. June 1 → July 14 (43 days) → 2 blocks instead of 6.
function splitIntoBlocks(dateFrom, dateTo, blockDays = DATE_BLOCK_DAYS) {
  const windows = [];
  let cur = new Date(dateFrom + 'T00:00:00Z');
  const end = new Date(dateTo   + 'T00:00:00Z');

  while (cur < end) {
    const wEnd = new Date(cur);
    wEnd.setDate(wEnd.getDate() + blockDays);
    if (wEnd > end) wEnd.setTime(end.getTime());
    windows.push([
      cur.toISOString().split('T')[0],
      wEnd.toISOString().split('T')[0]
    ]);
    cur.setDate(cur.getDate() + blockDays);
  }

  return windows;
}



function isValidIATA(code) {
  if (!code || code === 'ANY' || code === 'NEEDINFO') return false;
  return typeof code === 'string' && /^[A-Z]{3}$/.test(code.trim());
}



async function fetchFaresForDestination(from, to, dateFrom, dateTo, maxPrice, customLimit = RYANAIR_LIMIT) {
  const params = new URLSearchParams({
    departureAirportIataCode:  from,
    outboundDepartureDateFrom: dateFrom,
    outboundDepartureDateTo:   dateTo,
    currency:                  'GBP',
    offset:                    '0',
    limit:                     String(customLimit)
  });

  if (to && isValidIATA(to)) params.set('arrivalAirportIataCode', to);
  if (maxPrice)              params.set('priceValueTo', maxPrice);

  const ryanairUrl = 'https://www.ryanair.com/api/farfnd/3/oneWayFares?' + params;
  console.log('[Ryanair] Fetching:', ryanairUrl);

  try {
    const res = await fetchWithTimeout(ryanairUrl, { headers: RYANAIR_HEADERS }, 10000);
    if (!res.ok) {
      console.error('[Ryanair] HTTP', res.status, 'for', to || 'open');
      return [];
    }
    const data = await res.json();
    return Array.isArray(data.fares) ? data.fares : [];
  } catch (err) {
    console.error('[Ryanair] Fetch failed for', to || 'open', '-', err.message);
    return [];
  }
}



async function handleRyanairDeals(url, env) {
  const from = url.searchParams.get('from') || 'EDI';

  const rawDateFrom = url.searchParams.get('dateFrom');
  const rawDateTo   = url.searchParams.get('dateTo');
  const dateFrom    = (rawDateFrom && rawDateFrom !== 'null' && rawDateFrom !== '') ? rawDateFrom : todayStr();
  const dateTo      = (rawDateTo   && rawDateTo   !== 'null' && rawDateTo   !== '') ? rawDateTo   : daysFromNow(60);

  const rawMaxPrice = url.searchParams.get('maxPrice');
  const maxPrice    = (rawMaxPrice && rawMaxPrice !== 'null' && rawMaxPrice !== '') ? rawMaxPrice : null;

  const rawTo = (url.searchParams.get('to') || url.searchParams.get('targetIATA') || '').trim().toUpperCase();
  const isOpen = (rawTo === 'ANY' || rawTo === '' || rawTo === 'NEEDINFO');

  // Cap broad country searches to top MAX_CANDIDATES airports.
  // IATA mappings in prompts.js are already ordered by popularity so
  // slicing the front gives the busiest airports first.
  const allCandidates = rawTo.split(',').map(c => c.trim()).filter(isValidIATA);
  const candidates    = allCandidates.slice(0, MAX_CANDIDATES);

  if (allCandidates.length > MAX_CANDIDATES) {
    console.log('[Ryanair] Capped', allCandidates.length, 'to', MAX_CANDIDATES, ':', candidates.join(', '));
  }



  let outboundPool = [];

  if (candidates.length === 0) {
    if (!isOpen && rawTo !== '') {
      console.warn('[Ryanair] Unresolvable destination:', rawTo);
      return json({ flights: [] });
    }

    // Open search — single request, no splits needed
    console.log('[Ryanair] Open search from', from, dateFrom, '→', dateTo);
    const fares = await fetchFaresForDestination(from, '', dateFrom, dateTo, maxPrice);
    
    const bestPerDest = new Map();
    for (const raw of fares) {
      const f = normaliseRyanairFare(raw);
      if (!f) continue;
      
      // If user specified a multi-day range, outbound can't be on the final day
      if (dateFrom !== dateTo && f.outbound.date === dateTo) continue;

      const current = bestPerDest.get(f.destination);
      if (!current || f.pricePerPerson < current.pricePerPerson) {
        bestPerDest.set(f.destination, f);
      }
    }

    const diverseOutbounds = Array.from(bestPerDest.values()).sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    outboundPool = diverseOutbounds.slice(0, POOL_SIZE);

  } else {
    // Specific destinations — one fetch per (airport × 30-day block)
    const blocks = splitIntoBlocks(dateFrom, dateTo);
    const total  = candidates.length * blocks.length;
    console.log('[Ryanair]', candidates.length, 'airport(s) ×', blocks.length, 'block(s) =', total, 'requests:', candidates.join(', '));

    // Promise.allSettled — individual failures skip gracefully
    const settled = await Promise.allSettled(
      candidates.flatMap(iata =>
        blocks.map(([wFrom, wTo]) => fetchFaresForDestination(from, iata, wFrom, wTo, maxPrice))
      )
    );

    const rawFares = settled.flatMap(result => {
      if (result.status === 'fulfilled') return result.value;
      console.warn('[Ryanair] Outbound fetch rejected:', result.reason?.message || result.reason);
      return [];
    });

    const seen = new Set();
    const flights = rawFares
      .map(normaliseRyanairFare)
      .filter(fare => {
        if (!fare || seen.has(fare.id)) return false;
        seen.add(fare.id);
        return true;
      })
      .sort((a, b) => a.pricePerPerson - b.pricePerPerson);

    outboundPool = flights.slice(0, POOL_SIZE);
  }

  if (outboundPool.length === 0) {
    console.log('[Ryanair] Outbound pool empty — returning no flights');
    return json({ flights: [] });
  }

  console.log('[Ryanair] Pool:', outboundPool.length, 'outbounds — stitching return legs...');



  const returnSettled = await Promise.allSettled(
    outboundPool.map(async (flight) => {
      let returnStart = flight.outbound.date;
      let returnEnd   = dateTo;

      // If user didn't specify an end date, cap the trip length at 21 days
      if (!rawDateTo || rawDateTo === 'null' || rawDateTo === '') {
        returnEnd = addDaysToDate(flight.outbound.date, 21);
      }

      // Safety check: if dateTo is earlier than returnStart, push it to returnStart
      if (new Date(returnEnd) < new Date(returnStart)) {
        returnEnd = returnStart;
      }

      const returnFares = await fetchFaresForDestination(
        flight.destination,
        flight.origin,
        returnStart,
        returnEnd,
        null
      );

      if (!returnFares || returnFares.length === 0) return null;

      const sorted = returnFares
        .map(normaliseRyanairFare)
        .filter(fare => {
          if (!fare) return false;
          // If returning on the same day, ensure they have at least 4 hours at the destination
          if (fare.outbound.date === flight.outbound.date) {
            if (fare.outbound.departure <= flight.outbound.arrival) return false;
            const arr = new Date(flight.outbound.date + 'T' + flight.outbound.arrival + ':00Z').getTime();
            const dep = new Date(fare.outbound.date + 'T' + fare.outbound.departure + ':00Z').getTime();
            if (dep - arr < 4 * 3600 * 1000) return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Penalize day trips if the user provided a multi-day range
          const penaltyA = (a.outbound.date === flight.outbound.date && dateFrom !== dateTo) ? 1000 : 0;
          const penaltyB = (b.outbound.date === flight.outbound.date && dateFrom !== dateTo) ? 1000 : 0;
          return (a.pricePerPerson + penaltyA) - (b.pricePerPerson + penaltyB);
        });

      if (sorted.length === 0) return null;

      const best           = sorted[0];
      const roundTrip      = { ...flight };
      roundTrip.inbound    = best.outbound;
      roundTrip.pricePerPerson = flight.pricePerPerson + best.pricePerPerson;
      roundTrip.totalPrice     = roundTrip.pricePerPerson * 2;
      roundTrip.nights         = Math.round(
        (new Date(best.outbound.date + 'T00:00:00Z') - new Date(flight.outbound.date + 'T00:00:00Z')) / 86400000
      );

      return roundTrip;
    })
  );



  const validRoundTrips = returnSettled
    .flatMap(result => {
      if (result.status === 'rejected') {
        console.warn('[Ryanair] Return stitch rejected:', result.reason?.message || result.reason);
        return [];
      }
      return result.value !== null && result.value?.inbound !== null ? [result.value] : [];
    })
    .sort((a, b) => {
      const penaltyA = (a.nights === 0 && dateFrom !== dateTo) ? 10000 : 0;
      const penaltyB = (b.nights === 0 && dateFrom !== dateTo) ? 10000 : 0;
      return (a.totalPrice + penaltyA) - (b.totalPrice + penaltyB);
    })
    .slice(0, RESULT_CAP);

  console.log('[Ryanair] Returning', validRoundTrips.length, 'round-trips (pool was ' + outboundPool.length + ')');
  return json({ flights: validRoundTrips });
}



async function handleGlobalMapDeals(url, env) {
  const from = url.searchParams.get('from') || 'EDI';
  const rawDateFrom = url.searchParams.get('dateFrom');
  const rawDateTo   = url.searchParams.get('dateTo');
  const dateFrom    = (rawDateFrom && rawDateFrom !== 'null' && rawDateFrom !== '') ? rawDateFrom : todayStr();
  const dateTo      = (rawDateTo   && rawDateTo   !== 'null' && rawDateTo   !== '') ? rawDateTo   : daysFromNow(60);

  // Fire exactly 1 fetch request to Ryanair's API with an open destination and high limit
  console.log('[Ryanair] Global Map Search from', from, dateFrom, '→', dateTo);
  const fares = await fetchFaresForDestination(from, '', dateFrom, dateTo, null, 250);

  const cityDeals = {};

  for (const raw of fares) {
    const flight = normaliseRyanairFare(raw);
    if (!flight) continue;

    const iataKey = flight.destination;
    if (!iataKey) continue;

    const price = flight.pricePerPerson;

    if (!cityDeals[iataKey] || price < cityDeals[iataKey].price) {
      cityDeals[iataKey] = {
        countryCode: raw.outbound?.arrivalAirport?.country?.code || '',
        countryName: flight.destinationCountry,
        cityName: flight.destinationName,
        iataCode: flight.destination,
        price: price,
        date: flight.departureDate,
        flight: flight // Full flight object for the DestinationModal
      };
    }
  }

  const result = Object.values(cityDeals).sort((a, b) => a.price - b.price);
  return json({ deals: result });
}



function normaliseRyanairFare(fare) {
  try {
    const out = fare.outbound;
    if (!out || out.soldOut || out.unavailable) return null;

    const price = out.price?.value;
    if (!price || typeof price !== 'number' || price <= 0) return null;

    const depDT        = new Date(out.departureDate);
    const arrDT        = new Date(out.arrivalDate);
    const durationMins = arrDT > depDT ? Math.round((arrDT - depDT) / 60000) : null;

    const depDate = out.departureDate.split('T')[0];
    const depTime = out.departureDate.split('T')[1]?.substring(0, 5) || '';
    const arrTime = out.arrivalDate?.split('T')[1]?.substring(0, 5)  || '';

    const destination        = out.arrivalAirport?.iataCode     || '';
    const destinationName    = out.arrivalAirport?.city?.name   || out.arrivalAirport?.name || destination;
    const destinationCountry = out.arrivalAirport?.countryName  || '';
    const flightNumber       = (out.flightNumber || '').replace(/\s+/g, '');

    if (!destination || !isValidIATA(destination)) return null;

    return {
      id:                 'ry-' + destination + '-' + depDate + '-' + (flightNumber || depTime.replace(':', '')),
      origin:             out.departureAirport?.iataCode || 'EDI',
      originName:         'Edinburgh',
      destination,
      destinationName:    sanitiseInput(destinationName, 100),
      destinationCountry: sanitiseInput(destinationCountry, 100),
      destinationFlag:    '',
      airline:            'Ryanair',
      airlineCode:        'FR',
      flightNumber,
      outbound:   { date: depDate, departure: depTime, arrival: arrTime, durationMins },
      inbound:    null,
      pricePerPerson: Math.round(price),
      totalPrice:     Math.round(price * 2),
      currency:   'GBP',
      stops:      0,
      nights:     null,
      departureDate: depDate
    };
  } catch (err) {
    console.warn('[normalise] Skipped malformed fare:', err.message);
    return null;
  }
}



async function handleParseIntent(request, env) {
  const body = await readBody(request, 10000);
  const raw  = sanitiseForPrompt(body.message, 300);
  if (!raw) return json({ error: 'message required' }, 400);

  const text   = await callGemini(buildParseIntentPrompt(raw, todayStr()), env, {
    models:            GEMINI_MODELS_STANDARD,
    maxOutputTokens:   1024,
    jsonMode:          true,
    systemInstruction: CORE_PERSONA
  });
  const intent = parseJSON(text);
  return json({ intent });
}



async function handleRateDeals(request, env) {
  const body = await readBody(request, 50000);
  if (!Array.isArray(body.flights)) return json({ error: 'flights array required' }, 400);
  if (body.flights.length === 0)    return json({ ratings: [] });

  const summaries = body.flights.slice(0, 20).map(f => ({
    id:             sanitiseInput(String(f.id || ''), 80),
    destination:    sanitiseInput(String(f.destinationName || f.destination || ''), 60),
    country:        sanitiseInput(String(f.destinationCountry || ''), 60),
    pricePerPerson: safeInt(f.pricePerPerson, 0, 0, 9999),
    totalFor2:      safeInt(f.totalPrice,     0, 0, 99999),
    nights:         safeInt(f.nights,         0, 0, 90),
    departureDate:  sanitiseInput(String(f.outbound?.date || ''), 10),
    durationMins:   safeInt(f.outbound?.durationMins, 0, 0, 1440)
  }));

  const text    = await callGemini(buildRateDealsPrompt(summaries), env, {
    models:            GEMINI_MODELS_LITE_ONLY,
    maxOutputTokens:   3072,
    jsonMode:          true,
    systemInstruction: CORE_PERSONA
  });
  const ratings = parseJSON(text);
  return json({ ratings: Array.isArray(ratings) ? ratings : [] });
}



async function handleDestinationGuide(request, env) {
  const body      = await readBody(request, 10000);
  const safeName  = sanitiseForPrompt(body.destinationName || body.destinationCode || 'the destination', 80);
  const safeMonth = sanitiseForPrompt(body.month || 'summer', 20);
  const safeDays  = safeInt(body.tripDays,      4, 1, 30);
  const safePrice = safeInt(body.totalPriceGBP, 0, 0, 9999);

  const text  = await callGemini(buildDestinationGuidePrompt(safeName, safeDays, safeMonth, safePrice), env, {
    models:            GEMINI_MODELS_LITE_ONLY,
    maxOutputTokens:   4096,
    jsonMode:          true,
    systemInstruction: CORE_PERSONA
  });
  const guide = parseJSON(text);
  return json({ guide });
}



async function handleCountryGuide(request, env) {
  const body        = await readBody(request, 5000);
  const countryName = sanitiseForPrompt(body.countryName, 80);
  if (!countryName) return json({ error: 'countryName required' }, 400);

  const text  = await callGemini(buildCountryGuidePrompt(countryName), env, {
    models:            GEMINI_MODELS_FAST,
    maxOutputTokens:   1024,
    jsonMode:          true,
    systemInstruction: CORE_PERSONA
  });
  const guide = parseJSON(text);
  return json({ guide });
}



async function handleChat(request, env) {
  const body    = await readBody(request, 5000);
  const message = sanitiseForPrompt(body.message, 300);
  if (!message) return json({ response: '' });

  const snippet = body.context?.flights?.length
    ? JSON.stringify(body.context.flights.slice(0, 3).map(f => ({
        to:    sanitiseInput(f.destinationName, 40),
        price: 'GBP ' + safeInt(f.pricePerPerson, 0, 0, 9999)
      })))
    : null;

  const text = await callGemini(buildChatPrompt(message, snippet), env, {
    models:            GEMINI_MODELS_FAST,
    maxOutputTokens:   256,
    systemInstruction: buildChatSystemInstruction()
  });
  return json({ response: text });
}



async function callGemini(prompt, env, options = {}) {
  const {
    models            = GEMINI_MODELS_STANDARD,
    maxOutputTokens   = 1024,
    jsonMode          = false,
    systemInstruction = CORE_PERSONA,
    _modelIndex       = 0
  } = options;

  if (_modelIndex >= models.length) {
    throw new Error('All Gemini models are currently unavailable. Please try again shortly.');
  }

  const model            = models[_modelIndex];
  const generationConfig = { temperature: 0.2, maxOutputTokens };
  if (jsonMode) generationConfig.responseMimeType = 'application/json';

  let res;
  try {
    res = await fetchWithTimeout(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + env.GEMINI_API_KEY,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents:          [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig
        })
      },
      25000
    );
  } catch (networkErr) {
    console.error('[Gemini] Network/timeout on ' + model + ':', networkErr.message);
    return callGemini(prompt, env, { ...options, _modelIndex: _modelIndex + 1 });
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error('[Gemini] ' + model + ' → HTTP ' + res.status + ':', errBody.substring(0, 200));
    return callGemini(prompt, env, { ...options, _modelIndex: _modelIndex + 1 });
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('[Gemini] OK — ' + model + ', ' + text.length + ' chars');
  return text;
}



function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function corsResponse(response, env) {
  const origin = (env && env.ALLOWED_ORIGIN) ? env.ALLOWED_ORIGIN : 'https://kieranpatton01.github.io';
  const h = new Headers(response.headers);
  h.set('Access-Control-Allow-Origin', origin);
  h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  h.set('X-Content-Type-Options', 'nosniff');
  return new Response(response.body, { status: response.status, headers: h });
}

function parseJSON(text) {
  if (!text) throw new Error('Empty response from Gemini');
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error('[parseJSON] Failed:', err.message, '| First 300 chars:', clean.substring(0, 300));
    throw new Error(`JSON Parse Error: ${err.message}`);
  }
}