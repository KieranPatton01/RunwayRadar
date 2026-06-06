/*
 * Static mock flight data for development.
 * Provides realistic direct flight routes from EDI while awaiting API access.
 */
export const MOCK_FLIGHTS = [
  {
    id: 'mock-edi-ams-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'AMS',
    destinationName: 'Amsterdam',
    destinationCountry: 'Netherlands',
    destinationFlag: '🇳🇱',
    airline: 'EasyJet',
    airlineCode: 'U2',
    outbound: {
      date: '2025-06-14',
      departure: '07:30',
      arrival: '09:50',
      durationMins: 80
    },
    inbound: {
      date: '2025-06-17',
      departure: '14:20',
      arrival: '15:40',
      durationMins: 80
    },
    totalPrice: 156.40,
    pricePerPerson: 78.20,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-bcn-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'BCN',
    destinationName: 'Barcelona',
    destinationCountry: 'Spain',
    destinationFlag: '🇪🇸',
    airline: 'Ryanair',
    airlineCode: 'FR',
    outbound: {
      date: '2025-06-14',
      departure: '06:15',
      arrival: '09:35',
      durationMins: 140
    },
    inbound: {
      date: '2025-06-18',
      departure: '20:30',
      arrival: '23:50',
      durationMins: 140
    },
    totalPrice: 98.50,
    pricePerPerson: 49.25,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-fao-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'FAO',
    destinationName: 'Faro',
    destinationCountry: 'Portugal',
    destinationFlag: '🇵🇹',
    airline: 'Ryanair',
    airlineCode: 'FR',
    outbound: {
      date: '2025-07-05',
      departure: '07:00',
      arrival: '10:20',
      durationMins: 200
    },
    inbound: {
      date: '2025-07-12',
      departure: '11:15',
      arrival: '14:35',
      durationMins: 200
    },
    totalPrice: 184.00,
    pricePerPerson: 92.00,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-agp-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'AGP',
    destinationName: 'Malaga',
    destinationCountry: 'Spain',
    destinationFlag: '🇪🇸',
    airline: 'Jet2',
    airlineCode: 'LS',
    outbound: {
      date: '2025-07-12',
      departure: '07:00',
      arrival: '11:05',
      durationMins: 185
    },
    inbound: {
      date: '2025-07-19',
      departure: '11:45',
      arrival: '15:50',
      durationMins: 185
    },
    totalPrice: 246.00,
    pricePerPerson: 123.00,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-dub-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'DUB',
    destinationName: 'Dublin',
    destinationCountry: 'Ireland',
    destinationFlag: '🇮🇪',
    airline: 'Ryanair',
    airlineCode: 'FR',
    outbound: {
      date: '2025-06-20',
      departure: '19:30',
      arrival: '20:55',
      durationMins: 85
    },
    inbound: {
      date: '2025-06-23',
      departure: '07:25',
      arrival: '08:50',
      durationMins: 85
    },
    totalPrice: 74.80,
    pricePerPerson: 37.40,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-pmi-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'PMI',
    destinationName: 'Palma',
    destinationCountry: 'Spain',
    destinationFlag: '🇪🇸',
    airline: 'Jet2',
    airlineCode: 'LS',
    outbound: {
      date: '2025-08-02',
      departure: '06:30',
      arrival: '10:50',
      durationMins: 200
    },
    inbound: {
      date: '2025-08-09',
      departure: '11:30',
      arrival: '15:50',
      durationMins: 200
    },
    totalPrice: 318.00,
    pricePerPerson: 159.00,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-tfs-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'TFS',
    destinationName: 'Tenerife',
    destinationCountry: 'Spain',
    destinationFlag: '🇪🇸',
    airline: 'Jet2',
    airlineCode: 'LS',
    outbound: {
      date: '2025-09-06',
      departure: '08:00',
      arrival: '13:30',
      durationMins: 270
    },
    inbound: {
      date: '2025-09-13',
      departure: '14:30',
      arrival: '19:50',
      durationMins: 260
    },
    totalPrice: 388.00,
    pricePerPerson: 194.00,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-cph-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'CPH',
    destinationName: 'Copenhagen',
    destinationCountry: 'Denmark',
    destinationFlag: '🇩🇰',
    airline: 'Norwegian',
    airlineCode: 'DY',
    outbound: {
      date: '2025-06-27',
      departure: '08:20',
      arrival: '11:05',
      durationMins: 105
    },
    inbound: {
      date: '2025-06-30',
      departure: '16:45',
      arrival: '17:30',
      durationMins: 105
    },
    totalPrice: 202.60,
    pricePerPerson: 101.30,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-prg-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'PRG',
    destinationName: 'Prague',
    destinationCountry: 'Czechia',
    destinationFlag: '🇨🇿',
    airline: 'Ryanair',
    airlineCode: 'FR',
    outbound: {
      date: '2025-06-06',
      departure: '11:20',
      arrival: '14:35',
      durationMins: 135
    },
    inbound: {
      date: '2025-06-09',
      departure: '15:15',
      arrival: '16:30',
      durationMins: 135
    },
    totalPrice: 118.20,
    pricePerPerson: 59.10,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-cia-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'CIA',
    destinationName: 'Rome',
    destinationCountry: 'Italy',
    destinationFlag: '🇮🇹',
    airline: 'Ryanair',
    airlineCode: 'FR',
    outbound: {
      date: '2025-07-18',
      departure: '07:45',
      arrival: '11:30',
      durationMins: 165
    },
    inbound: {
      date: '2025-07-22',
      departure: '12:20',
      arrival: '14:05',
      durationMins: 165
    },
    totalPrice: 144.40,
    pricePerPerson: 72.20,
    currency: 'GBP',
    stops: 0
  },
  {
    id: 'mock-edi-bud-1',
    origin: 'EDI',
    originName: 'Edinburgh',
    destination: 'BUD',
    destinationName: 'Budapest',
    destinationCountry: 'Hungary',
    destinationFlag: '🇭🇺',
    airline: 'Ryanair',
    airlineCode: 'FR',
    outbound: {
      date: '2025-06-27',
      departure: '14:55',
      arrival: '18:20',
      durationMins: 145
    },
    inbound: {
      date: '2025-06-30',
      departure: '18:50',
      arrival: '20:15',
      durationMins: 145
    },
    totalPrice: 132.60,
    pricePerPerson: 66.30,
    currency: 'GBP',
    stops: 0
  }
]
