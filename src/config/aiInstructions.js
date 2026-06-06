/*
 * Configuration for AI personality and static messaging.
 * Defines standard responses, prompts, and random destinations used across the app.
 */
export const WELCOME_MESSAGE = `Tell me what kind of trip you're dreaming of — a city adventure, a sunny beach escape, a romantic weekend? I'll help you find somewhere perfect if you arn't broke. `

export const SUGGESTED_PROMPTS = [
  'I want somewhere warm and sunny 🤤',
  'A city break with amazing food 🐛',
  'A relaxing beach holiday 🍆'
]

export const SEARCHING_MESSAGES = [
  'Calm down Im looking fatty...',
  'Checking for flights that can lift Libby...',
  'On it, Tart...',
  'Searching for deals that will alllow your clap...'
]

export const CONFIRMATION_MESSAGES = [
  'Amazing choice MMMs daughter.  Here are the best Ryanair deals — tap any card to see the full destination guide.',
  'Love that pick you nugget!  Here are your flights — tap a card to see what to do, eat, and how to get around.',
  'Great taste just like your father!  Here are the flights — hit Book on any card to grab your seats!'
]

export function buildResultsMessage(count) {
  if (count === 0) return "Hmm, I couldn't find flights for that — its not my code its just because you are a mongo."
  if (count === 1) return "Found one option for you pookie! Tap the card to see the full destination guide"
  return `Found **${count} flights**, sorted cheapest first perhaps! Tap any card for the full guide `
}

export const AI_AVATAR = '✈️'
export const AI_NAME   = 'RunwayRadar'

export const EMPTY_STATE_TITLE    = 'Where are we going Pookie?'
export const EMPTY_STATE_SUBTITLE = "Tell me what kind of holiday you're dreaming of and I'll help you find the perfect trip from Edinburgh perhaps!"

export const RANDOM_DESTINATIONS = [
  { name: 'Barcelona',  country: 'Spain',       iata: 'BCN', flag: '🇪🇸', tagline: 'Architecture, beaches, and the best tapas in Europe' },
  { name: 'Lisbon',     country: 'Portugal',    iata: 'LIS', flag: '🇵🇹', tagline: 'Trams, pastéis de nata, and golden Atlantic sunsets' },
  { name: 'Amsterdam',  country: 'Netherlands', iata: 'AMS', flag: '🇳🇱', tagline: 'Canals, museums, and world-class cycling culture' },
  { name: 'Prague',     country: 'Czechia',     iata: 'PRG', flag: '🇨🇿', tagline: 'Fairy-tale architecture and legendary beer culture' },
  { name: 'Dublin',     country: 'Ireland',     iata: 'DUB', flag: '🇮🇪', tagline: 'Craic, Guinness, and the wildest pub scene in Europe' },
  { name: 'Krakow',     country: 'Poland',      iata: 'KRK', flag: '🇵🇱', tagline: 'Medieval history, pierogi, and incredible nightlife' },
  { name: 'Budapest',   country: 'Hungary',     iata: 'BUD', flag: '🇭🇺', tagline: 'Thermal baths, ruin bars, and stunning Danube views' },
  { name: 'Málaga',     country: 'Spain',       iata: 'AGP', flag: '🇪🇸', tagline: 'Birthplace of Picasso, sunshine, and tapas heaven' },
  { name: 'Faro',       country: 'Portugal',    iata: 'FAO', flag: '🇵🇹', tagline: 'Gateway to the Algarve — golden cliffs and warm seas' },
  { name: 'Palma',      country: 'Spain',       iata: 'PMI', flag: '🇪🇸', tagline: 'Cathedral sunsets, hidden coves, and island magic' },
  { name: 'Ibiza',      country: 'Spain',       iata: 'IBZ', flag: '🇪🇸', tagline: 'More than clubs — stunning beaches and charming old town' },
  { name: 'Athens',     country: 'Greece',      iata: 'ATH', flag: '🇬🇷', tagline: 'Ancient history meets rooftop cocktails and street food' },
  { name: 'Heraklion',  country: 'Greece',      iata: 'HER', flag: '🇬🇷', tagline: 'Minoan palaces, gorges, and the real Cretan taverna life' },
  { name: 'Rhodes',     country: 'Greece',      iata: 'RHO', flag: '🇬🇷', tagline: 'Medieval walled city meets turquoise Aegean beaches' },
  { name: 'Malta',      country: 'Malta',       iata: 'MLA', flag: '🇲🇹', tagline: 'Knights, temples, and the clearest waters in the Med' },
  { name: 'Lanzarote',  country: 'Spain',       iata: 'ACE', flag: '🇪🇸', tagline: 'Volcanic landscapes, black beaches, and year-round sun' },
  { name: 'Tenerife',   country: 'Spain',       iata: 'TFS', flag: '🇪🇸', tagline: 'Mount Teide, whale watching, and endless summer vibes' },
  { name: 'Porto',      country: 'Portugal',    iata: 'OPO', flag: '🇵🇹', tagline: 'Port wine, azulejo tiles, and bridges over the Douro' },
  { name: 'Seville',    country: 'Spain',       iata: 'SVQ', flag: '🇪🇸', tagline: 'Flamenco, tapas, and Moorish architecture at its finest' },
  { name: 'Warsaw',     country: 'Poland',      iata: 'WAW', flag: '🇵🇱', tagline: 'Reborn city with incredible history, pierogis, and vodka bars' },
  { name: 'Copenhagen', country: 'Denmark',     iata: 'CPH', flag: '🇩🇰', tagline: 'Hygge, Noma, and the most liveable city in the world' },
  { name: 'Paphos',     country: 'Cyprus',      iata: 'PFO', flag: '🇨🇾', tagline: 'Aphrodite\'s birthplace — sea, ruins, and halloumi' },
  { name: 'Marrakech',  country: 'Morocco',     iata: 'RAK', flag: '🇲🇦', tagline: 'Souks, riads, and the most colourful city in Africa' }
]

export function getRandomDestination() {
  return RANDOM_DESTINATIONS[Math.floor(Math.random() * RANDOM_DESTINATIONS.length)]
}