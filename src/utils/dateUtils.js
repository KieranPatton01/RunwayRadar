/*
 * Date parsing and formatting utilities for flights and intents.
 * No external dependencies.
 */


export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}


export function formatTime(datetime) {
  if (!datetime) return ''

  if (/^\d{2}:\d{2}$/.test(datetime)) return datetime
  const date = new Date(datetime)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}


export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}


export function parsePTDuration(ptDuration) {
  if (!ptDuration) return 0
  const match = ptDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0', 10)
  const mins = parseInt(match[2] || '0', 10)
  return hours * 60 + mins
}


export function calculateNights(departureDate, returnDate) {
  if (!departureDate || !returnDate) return 0
  const d1 = new Date(departureDate)
  const d2 = new Date(returnDate)
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}


export function formatMonth(monthStr) {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}


export function today() {
  return new Date().toISOString().split('T')[0]
}


export function daysFromToday(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}


export function monthsFromNow(n) {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}


export function getSeason(monthNum) {
  if (monthNum >= 3 && monthNum <= 5) return 'spring'
  if (monthNum >= 6 && monthNum <= 8) return 'summer'
  if (monthNum >= 9 && monthNum <= 11) return 'autumn'
  return 'winter'
}


export function parseMonthIntent(monthStr) {
  if (!monthStr) return null

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]

  const lower = monthStr.toLowerCase().trim()


  if (lower === 'next month') {
    return monthsFromNow(1)
  }


  const idx = monthNames.findIndex(m => lower.startsWith(m.substring(0, 3)))
  if (idx !== -1) {
    const now = new Date()
    let year = now.getFullYear()

    if (idx < now.getMonth()) year++
    return `${year}-${String(idx + 1).padStart(2, '0')}`
  }

  return null
}
