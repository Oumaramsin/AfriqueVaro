const API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export const AFRICAN_STOCKS = [
  { symbole: 'EZA', nom: 'iShares MSCI South Africa ETF', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'AFK', nom: 'VanEck Africa Index ETF', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'NGE', nom: 'Global X Nigeria Index ETF', bourse: 'NSE', pays: 'NG' },
]

type AlphaVantageQuote = {
  symbole: string
  nom: string
  bourse: string
  cours: number
  variation: number
  variationPct: number
  volume: number
  dateUpdate: string
}

export async function fetchQuote(symbole: string): Promise<AlphaVantageQuote | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbole}&apikey=${API_KEY}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const data = await res.json()
    const quote = data['Global Quote']
    if (!quote || !quote['05. price']) return null

    return {
      symbole,
      nom: AFRICAN_STOCKS.find(s => s.symbole === symbole)?.nom || symbole,
      bourse: AFRICAN_STOCKS.find(s => s.symbole === symbole)?.bourse || '',
      cours: parseFloat(quote['05. price']),
      variation: parseFloat(quote['09. change']),
      variationPct: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      dateUpdate: quote['07. latest trading day'],
    }
  } catch {
    return null
  }
}

export async function fetchAllAfricanQuotes(): Promise<AlphaVantageQuote[]> {
  const results = []
  for (const stock of AFRICAN_STOCKS) {
    const quote = await fetchQuote(stock.symbole)
    if (quote) results.push(quote)
    await new Promise(resolve => setTimeout(resolve, 13000))
  }
  return results
}