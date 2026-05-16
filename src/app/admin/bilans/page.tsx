import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import BilansClient from './BilansClient'

export default async function BilansPage() {
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

  const { data: bilansData } = await supabase
    .from('bilans')
    .select('*, societes(nom, symbole)')
    .order('exercice', { ascending: false })

  return (
    <BilansClient
      societes={(societesData ?? []) as unknown[]}
      bilans={(bilansData ?? []) as unknown[]}
    />
  )
}