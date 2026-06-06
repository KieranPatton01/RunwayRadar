/*
 * Mapbox integration constants and coordinate mappings.
 * Used for plotting destinations on the interactive map.
 * Dependencies: vite env.
 */

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN


export const DESTINATION_COORDS = {
  AMS: { lng: 4.9041,  lat: 52.3676, name: 'Amsterdam',   country: 'Netherlands' },
  BCN: { lng: 2.1734,  lat: 41.3851, name: 'Barcelona',   country: 'Spain' },
  CDG: { lng: 2.3488,  lat: 48.8534, name: 'Paris',       country: 'France' },
  ORY: { lng: 2.3590,  lat: 48.7233, name: 'Paris Orly',  country: 'France' },
  DUB: { lng: -6.2603, lat: 53.3498, name: 'Dublin',      country: 'Ireland' },
  MAD: { lng: -3.7038, lat: 40.4168, name: 'Madrid',      country: 'Spain' },
  LIS: { lng: -9.1393, lat: 38.7223, name: 'Lisbon',      country: 'Portugal' },
  FAO: { lng: -7.9307, lat: 37.0177, name: 'Faro',        country: 'Portugal' },
  AGP: { lng: -4.4214, lat: 36.6213, name: 'Malaga',      country: 'Spain' },
  PMI: { lng: 2.6502,  lat: 39.5696, name: 'Palma',       country: 'Spain' },
  TFS: { lng: -16.5473, lat: 28.0457, name: 'Tenerife',   country: 'Spain' },
  ACE: { lng: -13.6033, lat: 29.0142, name: 'Lanzarote',  country: 'Spain' },
  CPH: { lng: 12.5683, lat: 55.6761, name: 'Copenhagen',  country: 'Denmark' },
  ARN: { lng: 18.0686, lat: 59.3293, name: 'Stockholm',   country: 'Sweden' },
  OSL: { lng: 10.7522, lat: 59.9139, name: 'Oslo',        country: 'Norway' },
  PRG: { lng: 14.4378, lat: 50.0755, name: 'Prague',      country: 'Czechia' },
  BUD: { lng: 19.0402, lat: 47.4979, name: 'Budapest',    country: 'Hungary' },
  KRK: { lng: 19.9450, lat: 50.0647, name: 'Krakow',      country: 'Poland' },
  CIA: { lng: 12.5949, lat: 41.7994, name: 'Rome',        country: 'Italy' },
  FCO: { lng: 12.4964, lat: 41.9028, name: 'Rome',        country: 'Italy' },
  NAP: { lng: 14.2681, lat: 40.8518, name: 'Naples',      country: 'Italy' },
  VCE: { lng: 12.3155, lat: 45.4408, name: 'Venice',      country: 'Italy' },
  MXP: { lng: 9.1895,  lat: 45.4654, name: 'Milan',       country: 'Italy' },
  ATH: { lng: 23.7275, lat: 37.9838, name: 'Athens',      country: 'Greece' },
  HER: { lng: 25.1442, lat: 35.3387, name: 'Heraklion',   country: 'Greece' },
  RHO: { lng: 28.0862, lat: 36.4341, name: 'Rhodes',      country: 'Greece' },
  SKG: { lng: 22.9356, lat: 40.6401, name: 'Thessaloniki',country: 'Greece' },
  DUS: { lng: 6.7735,  lat: 51.2217, name: 'Dusseldorf',  country: 'Germany' },
  BER: { lng: 13.4050, lat: 52.5200, name: 'Berlin',      country: 'Germany' },
  MUC: { lng: 11.5820, lat: 48.1351, name: 'Munich',      country: 'Germany' },
  VIE: { lng: 16.3738, lat: 48.2082, name: 'Vienna',      country: 'Austria' },
  ZRH: { lng: 8.5417,  lat: 47.3769, name: 'Zurich',      country: 'Switzerland' },
  BRU: { lng: 4.3517,  lat: 50.8503, name: 'Brussels',    country: 'Belgium' },
  WAW: { lng: 21.0122, lat: 52.2297, name: 'Warsaw',      country: 'Poland' },
  LGW: { lng: -0.1276, lat: 51.5074, name: 'London',      country: 'UK' },
  LTN: { lng: -0.3781, lat: 51.8797, name: 'London Luton',country: 'UK' },
  BHX: { lng: -1.8904, lat: 52.4862, name: 'Birmingham',  country: 'UK' },
  MAN: { lng: -2.2426, lat: 53.4808, name: 'Manchester',  country: 'UK' },
  DXB: { lng: 55.2708, lat: 25.2048, name: 'Dubai',       country: 'UAE' },
  AYT: { lng: 30.7133, lat: 36.8969, name: 'Antalya',     country: 'Turkey' },
}


export function getCoordsForDestination(iataCode) {
  return DESTINATION_COORDS[iataCode] || {
    lng: 15.0,
    lat: 50.0,
    name: iataCode,
    country: 'Europe'
  }
}


export function getMapStyle(theme) {
  switch (theme) {
    case 'light':
      return 'mapbox://styles/mapbox/light-v11'
    case 'pink':
      return 'mapbox://styles/mapbox/light-v11'
    case 'dark':
    default:
      return 'mapbox://styles/mapbox/dark-v11'
  }
}
