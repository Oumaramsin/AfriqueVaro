import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PaysClient from './PaysClient'

export default async function PaysPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: pays } = await supabase
    .from('pays')
    .select('*')
    .eq('is_active', true)
    .order('nom')

  const { data: macro } = await supabase
    .from('donnees_macro')
    .select('*, pays(nom, drapeau, code)')
    .order('annee', { ascending: false })

  return <PaysClient pays={pays || []} macro={macro || []} />
}