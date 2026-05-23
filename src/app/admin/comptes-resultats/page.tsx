import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import CRClient from './CRClient'

export default async function ComptesResultatsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: societesData } = await supabase
    .from('societes')
    .select('id, nom, symbole, bourses(code)')
    .eq('is_active', true)
    .order('nom')

  const { data: crsData } = await supabase
    .from('comptes_resultats')
    .select('*, societes(nom, symbole)')
    .order('created_at', { ascending: false })

  return (
    <CRClient
      societes={(societesData ?? []) as unknown[]}
      crs={(crsData ?? []) as unknown[]}
    />
  )
}