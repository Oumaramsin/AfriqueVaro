const API_KEY = process.env.ALPHA_VANTAGE_API_KEY

// Symboles de grandes valeurs africaines cotées
export const AFRICAN_STOCKS = [
  { symbole: 'NPN.JO', nom: 'Naspers', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'MTN.JO', nom: 'MTN Group', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'SOL.JO', nom: 'Sasol', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'SBK.JO', nom: 'Standard Bank', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'AGL.JO', nom: 'Anglo American', bourse: 'JSE', pays: 'ZA' },
  { symbole: 'DANGCEM.LG', nom: 'Dangote Cement', bourse: 'NSE', pays: 'NG' },
  { symbole: 'GTCO.LG', nom: 'Guaranty Trust', bourse: 'NSE', pays: 'NG' },
  { symbole: 'ZENITHBANK.LG', nom: 'Zenith Bank', bourse: 'NSE', pays: 'NG' },
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

// Récupère le cours d'une action
export async function fetchQuote(symbole: string): Promise<AlphaVantageQuote | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbole}&apikey=${API_KEY}`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache 1h
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

// Récupère tous les cours africains
export async function fetchAllAfricanQuotes(): Promise<AlphaVantageQuote[]> {
  const results = []

  for (const stock of AFRICAN_STOCKS) {
    const quote = await fetchQuote(stock.symbole)
    if (quote) results.push(quote)
    // Pause 12 secondes entre chaque requête (limite 5 req/min gratuit)
    await new Promise(resolve => setTimeout(resolve, 12000))
  }

  return results
}