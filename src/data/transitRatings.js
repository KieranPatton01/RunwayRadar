/*
 * Lookup data for airport-to-city transit options.
 * Maps IATA codes to transit ratings, modes, costs, and helpful tips.
 * Ratings: 5=excellent, 4=good, 3=moderate, 2=awkward, 1=difficult
 */
export const TRANSIT_RATINGS = {
  AMS: {
    rating:  5,
    icon:    '🚆',
    mode:    'Direct train',
    time:    '15 min',
    cost:    '£4',
    tip:     'Sprinter train from Schiphol to Amsterdam Centraal runs every 15 minutes'
  },
  BCN: {
    rating:  4,
    icon:    '🚇',
    mode:    'Metro / Aerobús',
    time:    '35 min',
    cost:    '£5',
    tip:     'Metro L9 Sud or Aerobús to Plaça Catalunya — both cheap and easy'
  },
  CDG: {
    rating:  3,
    icon:    '🚆',
    mode:    'RER B train',
    time:    '45 min',
    cost:    '£12',
    tip:     'RER B to Gare du Nord — can be crowded, buy tickets before boarding'
  },
  ORY: {
    rating:  3,
    icon:    '🚌',
    mode:    'Orlybus',
    time:    '40 min',
    cost:    '£9',
    tip:     'Orlybus to Denfert-Rochereau is the simplest option from Orly'
  },
  DUB: {
    rating:  3,
    icon:    '🚌',
    mode:    'Airlink bus',
    time:    '30 min',
    cost:    '£6',
    tip:     'No direct train. Airlink 747 bus runs every 10 mins to city centre'
  },
  MAD: {
    rating:  5,
    icon:    '🚇',
    mode:    'Metro Line 8',
    time:    '25 min',
    cost:    '£3',
    tip:     'Metro Line 8 direct to Nuevos Ministerios, then change for city centre'
  },
  LIS: {
    rating:  4,
    icon:    '🚇',
    mode:    'Metro red line',
    time:    '30 min',
    cost:    '£2',
    tip:     'Metro red line direct to Alameda and Baixa-Chiado — one of Europe\'s cheapest airport metros'
  },
  FAO: {
    rating:  2,
    icon:    '🚌',
    mode:    'Bus or taxi',
    time:    '15–60 min',
    cost:    '£3 bus',
    tip:     'Bus to Faro centre is cheap but resorts like Albufeira need taxi or shuttle'
  },
  AGP: {
    rating:  3,
    icon:    '🚌',
    mode:    'City bus',
    time:    '35 min',
    cost:    '£2',
    tip:     'City bus 19 to Malaga centre is very cheap. Taxi to resorts costs around £15'
  },
  PMI: {
    rating:  4,
    icon:    '🚌',
    mode:    'Bus line 1',
    time:    '25 min',
    cost:    '£3',
    tip:     'EMT Bus 1 runs directly to Palma city centre every 15 minutes'
  },
  TFS: {
    rating:  2,
    icon:    '🚌',
    mode:    'TITSA bus',
    time:    '50 min',
    cost:    '£5',
    tip:     'TITSA bus covers major resorts but runs infrequently — check times in advance'
  },
  ACE: {
    rating:  2,
    icon:    '🚌',
    mode:    'Bus or taxi',
    time:    '25 min',
    cost:    '£4',
    tip:     'Bus L22 to Arrecife, but most resorts like Puerto del Carmen need a taxi'
  },
  CPH: {
    rating:  5,
    icon:    '🚇',
    mode:    'Metro M2',
    time:    '15 min',
    cost:    '£5',
    tip:     'Metro M2 direct from the terminal to the city centre — fast and frequent'
  },
  ARN: {
    rating:  4,
    icon:    '🚆',
    mode:    'Arlanda Express',
    time:    '20 min',
    cost:    '£26',
    tip:     'Arlanda Express is fast but pricey. Commuter train Pendeltåg is slower but cheaper at £8'
  },
  OSL: {
    rating:  4,
    icon:    '🚆',
    mode:    'Flytoget train',
    time:    '20 min',
    cost:    '£18',
    tip:     'Airport express runs every 10 minutes. NSB regional train is slower but half the price'
  },
  PRG: {
    rating:  4,
    icon:    '🚇',
    mode:    'Bus + Metro',
    time:    '45 min',
    cost:    '£1.50',
    tip:     'One of the cheapest airport links in Europe — bus 119 then Metro A into the centre'
  },
  BUD: {
    rating:  3,
    icon:    '🚌',
    mode:    'Bus 100E',
    time:    '35 min',
    cost:    '£3',
    tip:     'Bus 100E runs express to Deák Ferenc tér — no direct train, but bus is reliable'
  },
  KRK: {
    rating:  3,
    icon:    '🚆',
    mode:    'Train or bus',
    time:    '20 min',
    cost:    '£2',
    tip:     'Train and bus both connect to Kraków Główny station in the city centre'
  },
  CIA: {
    rating:  2,
    icon:    '🚌',
    mode:    'Bus or taxi',
    time:    '45 min',
    cost:    '£5',
    tip:     'Ciampino is well out of Rome. Shuttle buses run to Termini. Taxi costs around £35'
  },
  FCO: {
    rating:  4,
    icon:    '🚆',
    mode:    'Leonardo Express',
    time:    '32 min',
    cost:    '£14',
    tip:     'Direct non-stop train to Roma Termini every 30 minutes — fast and reliable'
  },
  NAP: {
    rating:  3,
    icon:    '🚌',
    mode:    'Alibus',
    time:    '20 min',
    cost:    '£4',
    tip:     'Alibus runs to Piazza Garibaldi in central Naples every 20 minutes'
  },
  VCE: {
    rating:  3,
    icon:    '🚢',
    mode:    'Water bus',
    time:    '75 min',
    cost:    '£7',
    tip:     'Alilaguna water bus is scenic but slow. ACTV bus to Piazzale Roma is faster at 20 mins'
  },
  MXP: {
    rating:  4,
    icon:    '🚆',
    mode:    'Malpensa Express',
    time:    '50 min',
    cost:    '£13',
    tip:     'Direct train to Milano Centrale. Also connects to Cadorna for Trenitalia routes'
  },
  ATH: {
    rating:  4,
    icon:    '🚇',
    mode:    'Metro Line 3',
    time:    '40 min',
    cost:    '£9',
    tip:     'Direct Metro Line 3 to Syntagma Square, running until midnight daily'
  },
  HER: {
    rating:  2,
    icon:    '🚌',
    mode:    'Bus or taxi',
    time:    '15 min',
    cost:    '£2',
    tip:     'Close to Heraklion town, but most tourists need a taxi to resorts like Hersonissos'
  },
  RHO: {
    rating:  2,
    icon:    '🚌',
    mode:    'Bus or taxi',
    time:    '25 min',
    cost:    '£3',
    tip:     'City bus to Rhodes Town is cheap. Resorts in the south need a taxi or rental car'
  },
  SKG: {
    rating:  3,
    icon:    '🚌',
    mode:    'City bus',
    time:    '30 min',
    cost:    '£2',
    tip:     'Bus 78N connects the airport to Thessaloniki city centre'
  },
  DUS: {
    rating:  5,
    icon:    '🚆',
    mode:    'SkyTrain + S-Bahn',
    time:    '20 min',
    cost:    '£3',
    tip:     'Free SkyTrain monorail to Düsseldorf Flughafen station, then S-Bahn into the city'
  },
  BER: {
    rating:  5,
    icon:    '🚆',
    mode:    'S-Bahn direct',
    time:    '30 min',
    cost:    '£3.50',
    tip:     'S9 or S45 run direct from BER to Berlin city stations on a normal transit ticket'
  },
  MUC: {
    rating:  5,
    icon:    '🚆',
    mode:    'S-Bahn S1 or S8',
    time:    '40 min',
    cost:    '£12',
    tip:     'S1 and S8 both run to Munich Hauptbahnhof every 10 minutes'
  },
  VIE: {
    rating:  5,
    icon:    '🚆',
    mode:    'CAT or S7 train',
    time:    '16 min',
    cost:    '£4 (S7)',
    tip:     'City Airport Train takes 16 mins for £12. S7 regional train is £4 and only 5 mins slower'
  },
  ZRH: {
    rating:  5,
    icon:    '🚆',
    mode:    'Direct train',
    time:    '10 min',
    cost:    '£5',
    tip:     'Direct train from the airport terminal to Zürich HB — one of the best airport rail links in Europe'
  },
  BRU: {
    rating:  4,
    icon:    '🚆',
    mode:    'Direct train',
    time:    '20 min',
    cost:    '£4',
    tip:     'Direct train to Brussels Midi, Central, and Nord stations'
  },
  WAW: {
    rating:  4,
    icon:    '🚆',
    mode:    'SKM train',
    time:    '25 min',
    cost:    '£1.50',
    tip:     'One of the cheapest airport rail links in Europe — SKM line S3 to Warsaw Centralna'
  },
  DXB: {
    rating:  5,
    icon:    '🚇',
    mode:    'Metro Red Line',
    time:    '35 min',
    cost:    '£3',
    tip:     'Modern, air-conditioned metro runs directly into Dubai city — very easy'
  },
  AYT: {
    rating:  2,
    icon:    '🚌',
    mode:    'Havas bus or taxi',
    time:    '45 min',
    cost:    '£3 bus',
    tip:     'Havas bus runs to Antalya centre. Most beach resorts need a transfer or taxi'
  },
  LGW: {
    rating:  5,
    icon:    '🚆',
    mode:    'Gatwick Express',
    time:    '30 min',
    cost:    '£20',
    tip:     'Gatwick Express to London Victoria runs every 15 minutes — or Southern trains for half the price'
  },
  LTN: {
    rating:  3,
    icon:    '🚌',
    mode:    'Bus or train',
    time:    '60 min',
    cost:    '£6',
    tip:     'Shuttle bus to Luton Airport Parkway, then train to St Pancras. Allow 90 mins total'
  },
  STN: {
    rating:  3,
    icon:    '🚆',
    mode:    'Stansted Express',
    time:    '50 min',
    cost:    '£19',
    tip:     'Direct train to Liverpool Street but pricey — book in advance for cheaper fares'
  }
}

export function getTransitRating(iataCode) {
  return TRANSIT_RATINGS[iataCode] || {
    rating:  3,
    icon:    '🚌',
    mode:    'Bus or taxi',
    time:    'Varies',
    cost:    'Varies',
    tip:     'Check local transport options before you travel'
  }
}

export function getTransitColour(rating) {
  if (rating >= 4) return 'var(--transit-easy)'
  if (rating === 3) return 'var(--transit-moderate)'
  return 'var(--transit-difficult)'
}

export function getTransitLabel(rating) {
  if (rating >= 4) return 'Easy transit'
  if (rating === 3) return 'Moderate'
  return 'Transfer needed'
}
