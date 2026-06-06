/*
 * Price formatting and deal rating logic (pre-AI evaluation).
 * No external dependencies.
 */


export function formatPrice(amount) {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}


export function formatPricePerPerson(totalPrice) {
  const pp = Math.ceil(totalPrice / 2)
  return `${formatPrice(pp)}/pp`
}


export function calculateLocalDealRating(totalPrice, nights) {
  if (!totalPrice || nights === 0) return 3


  const pppn = totalPrice / 2 / Math.max(nights, 1)

  if (pppn < 12)  return 5
  if (pppn < 20)  return 4
  if (pppn < 32)  return 3
  if (pppn < 50)  return 2
  return 1
}


export function getDealLabel(rating) {
  switch (rating) {
    case 5: return 'Exceptional deal'
    case 4: return 'Great value'
    case 3: return 'Good deal'
    case 2: return 'Fair price'
    case 1: return 'Pricey'
    default: return 'Checking...'
  }
}


export function getDealEmoji(rating) {
  switch (rating) {
    case 5: return '🔥'
    case 4: return '✨'
    case 3: return '👍'
    case 2: return '😐'
    case 1: return '💸'
    default: return '⏳'
  }
}


export function getDealColour(rating) {
  return `var(--deal-${Math.max(1, Math.min(5, rating || 3))})`
}


export function isBudgetFlight(totalPrice) {
  return totalPrice < 150
}
