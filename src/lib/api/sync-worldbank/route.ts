import { createClient } from '@supabase/supabase-js'
import { fetchAllIndicateurs, WB_COUNTRY_CODES, INDICATEUR_LABELS } from '@/lib/api/worldbank'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: pays } = await supabase
      .from('pays')
      .select('id, code, nom')
      .eq('is_active', true)

    if (!pays) return NextResponse.json({ error: 'Aucun pays trouvé' }, { status: 404 })

    let totalInserted = 0
    const errors: string[] = []

    for (const p of pays) {
      if (!WB_COUNTRY_CODES[p.code]) continue

      try {
        const indicateurs = await fetchAllIndicateurs(p.code)
        if (!indicateurs) continue

        for (const [key, data] of Object.entries(indicateurs)) {
          if (!data) continue

          const { data: existing } = await supabase
            .from('donnees_macro')
            .select('id')
            .eq('pays_id', p.id)
            .eq('indicateur', INDICATEUR_LABELS[key])
            .eq('annee', parseInt(data.annee))
            .single()

          if (existing) continue

          await supabase.from('donnees_macro').insert({
            pays_id: p.id,
            indicateur: INDICATEUR_LABELS[key],
            valeur: data.valeur,
            unite: key === 'PIB' || key === 'IDE' || key === 'BALANCE' ? 'USD' :
                   key === 'POPULATION' ? 'habitants' : '%',
            annee: parseInt(data.annee),
            source: 'Banque Mondiale',
          })
          totalInserted++
        }
      } catch (err) {
        errors.push(`Erreur pour ${p.nom}: ${err}`)
      }
    }

    return NextResponse.json({ success: true, inserted: totalInserted, errors })

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}