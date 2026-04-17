import { createClient } from '@supabase/supabase-js'
import { fetchQuote, AFRICAN_STOCKS } from '@/lib/api/alphavantage'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Récupère les bourses en DB
    const { data: bourses } = await supabase
      .from('bourses')
      .select('id, code')

    if (!bourses) return NextResponse.json({ error: 'Bourses introuvables' }, { status: 404 })

    let totalInserted = 0
    const errors: string[] = []
    const today = new Date().toISOString().split('T')[0]

    for (const stock of AFRICAN_STOCKS) {
      try {
        const quote = await fetchQuote(stock.symbole)
        if (!quote) continue

        const bourse = bourses.find(b => b.code === stock.bourse)
        if (!bourse) continue

        // Vérifie si le cours existe déjà aujourd'hui
        const { data: existing } = await supabase
          .from('cours_actions')
          .select('id')
          .eq('symbole', stock.symbole.split('.')[0])
          .eq('date_cours', today)
          .single()

        if (existing) continue

        await supabase.from('cours_actions').insert({
          bourse_id: bourse.id,
          symbole: stock.symbole.split('.')[0],
          nom_entreprise: stock.nom,
          cours: quote.cours,
          variation: quote.variationPct,
          volume: quote.volume,
          date_cours: today,
        })

        totalInserted++

        // Pause 12s entre chaque requête (limite gratuite Alpha Vantage)
        await new Promise(resolve => setTimeout(resolve, 12000))

      } catch (err) {
        errors.push(`Erreur ${stock.symbole}: ${err}`)
      }
    }

    return NextResponse.json({ success: true, inserted: totalInserted, errors })

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}