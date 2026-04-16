// Indicateurs World Bank disponibles
export const WB_INDICATORS = {
  PIB: 'NY.GDP.MKTP.CD',              // PIB en USD courants
  PIB_CROISSANCE: 'NY.GDP.MKTP.KD.ZG', // Croissance PIB %
  INFLATION: 'FP.CPI.TOTL.ZG',        // Inflation %
  CHOMAGE: 'SL.UEM.TOTL.ZS',          // Chômage %
  POPULATION: 'SP.POP.TOTL',          // Population
  DETTE: 'GC.DOD.TOTL.GD.ZS',         // Dette publique % PIB
  IDE: 'BX.KLT.DINV.CD.WD',           // IDE entrants USD
  BALANCE: 'BN.CAB.XOKA.CD',          // Balance courante USD
}

// Codes pays World Bank pour l'Afrique
export const WB_COUNTRY_CODES: Record<string, string> = {
  'SN': 'SEN', // Sénégal
  'CI': 'CIV', // Côte d'Ivoire
  'CM': 'CMR', // Cameroun
  'NG': 'NGA', // Nigeria
  'ZA': 'ZAF', // Afrique du Sud
  'KE': 'KEN', // Kenya
  'GH': 'GHA', // Ghana
  'MA': 'MAR', // Maroc
  'EG': 'EGY', // Égypte
  'ET': 'ETH', // Éthiopie
}

type WBResponse = {
  value: number | null
  date: string
  country: { value: string }
  indicator: { value: string }
}

// Récupère un indicateur pour un pays
export async function fetchIndicateur(
  countryCode: string,
  indicator: string,
  annees: number = 5
): Promise<WBResponse[]> {
  const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&mrv=${annees}&per_page=10`

  const res = await fetch(url, { next: { revalidate: 86400 } }) // Cache 24h
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`)

  const data = await res.json()
  if (!data[1]) return []

  return data[1].filter((d: WBResponse) => d.value !== null)
}

// Récupère tous les indicateurs pour un pays
export async function fetchAllIndicateurs(countryCode: string) {
  const wbCode = WB_COUNTRY_CODES[countryCode]
  if (!wbCode) return null

  const results = await Promise.allSettled(
    Object.entries(WB_INDICATORS).map(async ([key, indicator]) => {
      const data = await fetchIndicateur(wbCode, indicator, 3)
      return { key, data: data[0] || null } // Prend la donnée la plus récente
    })
  )

  const indicateurs: Record<string, { valeur: number; annee: string; indicateur: string } | null> = {}

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const { key, data } = result.value
      indicateurs[key] = data ? {
        valeur: data.value!,
        annee: data.date,
        indicateur: data.indicator.value
      } : null
    }
  })

  return indicateurs
}

// Formate les valeurs pour l'affichage
export function formatIndicateur(key: string, valeur: number): string {
  switch (key) {
    case 'PIB':
      if (valeur >= 1e12) return `${(valeur / 1e12).toFixed(2)} Mrd $`
      if (valeur >= 1e9) return `${(valeur / 1e9).toFixed(1)} Mrd $`
      return `${(valeur / 1e6).toFixed(0)} M$`
    case 'PIB_CROISSANCE':
    case 'INFLATION':
    case 'CHOMAGE':
    case 'DETTE':
      return `${valeur.toFixed(1)} %`
    case 'POPULATION':
      if (valeur >= 1e6) return `${(valeur / 1e6).toFixed(1)} M`
      return `${(valeur / 1e3).toFixed(0)} K`
    case 'IDE':
    case 'BALANCE':
      if (Math.abs(valeur) >= 1e9) return `${(valeur / 1e9).toFixed(1)} Mrd $`
      return `${(valeur / 1e6).toFixed(0)} M$`
    default:
      return valeur.toLocaleString('fr-FR')
  }
}

export const INDICATEUR_LABELS: Record<string, string> = {
  PIB: 'PIB',
  PIB_CROISSANCE: 'Croissance PIB',
  INFLATION: 'Inflation',
  CHOMAGE: 'Chômage',
  POPULATION: 'Population',
  DETTE: 'Dette publique',
  IDE: 'IDE entrants',
  BALANCE: 'Balance courante',
}