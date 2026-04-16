import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ActualitesClient from './ActualitesClient'

export default async function ActualitesPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const { data: actualites } = await supabase
    .from('actualites')
    .select('*, pays(nom, drapeau, code)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const { data: pays } = await supabase
    .from('pays')
    .select('id, nom, code, drapeau')
    .order('nom')

  return (
    <ActualitesClient
      actualites={actualites || []}
      pays={pays || []}
      userRole={profile?.role || 'free'}
    />
  )
}