import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MarchesClient from './MarchesClient'

export default async function MarchesPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: bourses } = await supabase
    .from('bourses')
    .select('*')
    .eq('is_active', true)
    .order('nom')

  const { data: cours } = await supabase
    .from('cours_actions')
    .select('*, bourses(nom, code, devise)')
    .order('date_cours', { ascending: false })

  const { data: taux } = await supabase
    .from('taux_change')
    .select('*')
    .order('date_taux', { ascending: false })
    .limit(20)

  return (
    <MarchesClient
      bourses={bourses || []}
      cours={cours || []}
      taux={taux || []}
    />
  )
}