import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import SocietesClient from './SocietesClient'

export default async function SocietesPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: societes }, { data: secteurs }, { data: bourses }, { data: zones }] =
    await Promise.all([
      supabase.from('societes').select('*, secteurs(nom), bourses(nom, code), zones(nom)').order('nom'),
      supabase.from('secteurs').select('*').order('nom'),
      supabase.from('bourses').select('*').order('nom'),
      supabase.from('zones').select('*').order('nom'),
    ])

  return (
    <SocietesClient
      societes={societes || []}
      secteurs={secteurs || []}
      bourses={bourses || []}
      zones={zones || []}
    />
  )
}