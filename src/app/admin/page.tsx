import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: pays } = await supabase
    .from('pays')
    .select('*')
    .order('nom')

  const { data: bourses } = await supabase
    .from('bourses')
    .select('*')
    .order('nom')

  return <AdminClient pays={pays || []} bourses={bourses || []} />
}