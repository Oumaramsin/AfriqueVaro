'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  id: string
  full_name: string
  role: string
  avatar_url: string | null
  created_at: string
}

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 €',
    color: 'border-white/10',
    features: [
      'Actualités générales',
      'Données différées 24h',
      '5 pays suivis',
      'Taux de change basiques',
    ],
    locked: [
      'Données temps réel',
      'Actualités premium',
      'Rapports exclusifs',
      'Alertes personnalisées',
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9,90 €/mois',
    color: 'border-blue-500/30',
    badge: '🔵',
    features: [
      'Tout le plan Gratuit',
      'Données temps réel',
      'Tous les pays',
      'Actualités premium',
      'Export CSV',
    ],
    locked: [
      'Rapports exclusifs',
      'API access',
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '29,90 €/mois',
    color: 'border-[#C8A951]/30',
    badge: '⭐',
    features: [
      'Tout le plan Pro',
      'Rapports sur mesure',
      'Accès API',
      'Alertes personnalisées',
      'Support prioritaire',
    ],
    locked: []
  },
]

export default function ProfilClient({
  profile, email
}: {
  profile: Profile | null
  email: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [tab, setTab] = useState<'profil' | 'abonnement'>('profil')

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile!.id)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentPlan = PLANS.find(p => p.id === profile?.role) || PLANS[0]

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* NAV */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-50">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold">
              Afrique<span className="text-[#C8A951]">Varo</span>
            </h1>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">Accueil</Link>
            <Link href="/marches" className="text-gray-500 hover:text-white text-sm transition-colors">Marchés</Link>
            <Link href="/actualites" className="text-gray-500 hover:text-white text-sm transition-colors">Actualités</Link>
            <Link href="/pays" className="text-gray-500 hover:text-white text-sm transition-colors">Pays</Link>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] text-sm font-bold">
          {profile?.full_name?.charAt(0).toUpperCase()}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] text-2xl font-bold">
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">{email}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                profile?.role === 'premium' ? 'bg-[#C8A951]/20 text-[#C8A951]' :
                profile?.role === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                profile?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                'bg-white/10 text-gray-400'
              }`}>
                {profile?.role === 'premium' ? '⭐ Premium' :
                 profile?.role === 'pro' ? '🔵 Pro' :
                 profile?.role === 'admin' ? '🔐 Admin' : '🆓 Gratuit'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Membre depuis {profile?.created_at ? formatDate(profile.created_at) : ''}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {(['profil', 'abonnement'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                tab === t
                  ? 'bg-[#C8A951] text-black'
                  : 'bg-[#141414] text-gray-400 border border-white/5 hover:border-white/10'
              }`}>
              {t === 'profil' ? '👤 Mon profil' : '⭐ Abonnement'}
            </button>
          ))}
        </div>

        {/* ── ONGLET PROFIL ── */}
        {tab === 'profil' && (
          <div className="space-y-4">

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-sm">
                ✓ Profil mis à jour avec succès
              </div>
            )}

            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
              <h3 className="font-semibold text-white mb-2">Informations personnelles</h3>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  Email
                </label>
                <div className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-gray-500 text-sm">
                  {email}
                </div>
                <p className="text-xs text-gray-600 mt-1">{"L'email ne peut pas être modifié"}</p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C8A951] text-sm"
                />
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>

            {/* Liens rapides */}
            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <Link href="/marches" className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span>📈</span>
                  <span className="text-sm text-gray-300">Marchés financiers</span>
                </div>
                <span className="text-gray-600 text-sm">→</span>
              </Link>
              <Link href="/actualites" className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span>📰</span>
                  <span className="text-sm text-gray-300">Actualités économiques</span>
                </div>
                <span className="text-gray-600 text-sm">→</span>
              </Link>
              <Link href="/pays" className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <span>🌍</span>
                  <span className="text-sm text-gray-300">Pays africains</span>
                </div>
                <span className="text-gray-600 text-sm">→</span>
              </Link>
            </div>

            {/* Déconnexion */}
            <button onClick={handleSignOut}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium hover:bg-red-500/15 transition-colors">
              🚪 Se déconnecter
            </button>
          </div>
        )}

        {/* ── ONGLET ABONNEMENT ── */}
        {tab === 'abonnement' && (
          <div className="space-y-4">

            {/* Plan actuel */}
            <div className="bg-[#141414] rounded-2xl border border-[#C8A951]/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Plan actuel</p>
                  <p className="text-lg font-bold text-white">{currentPlan.name}</p>
                </div>
                <span className="text-2xl">{currentPlan.badge || '🆓'}</span>
              </div>
            </div>

            {/* Plans disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div key={plan.id} className={`bg-[#141414] rounded-2xl border p-5 ${
                  plan.id === profile?.role
                    ? 'border-[#C8A951]/40'
                    : plan.color
                }`}>
                  {plan.id === profile?.role && (
                    <div className="text-xs bg-[#C8A951]/20 text-[#C8A951] px-2 py-0.5 rounded-full font-medium inline-block mb-3">
                      Plan actuel
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span>{plan.badge || '🆓'}</span>
                    <span className="font-bold text-white">{plan.name}</span>
                  </div>
                  <p className="text-[#C8A951] font-semibold mb-4">{plan.price}</p>

                  <div className="space-y-2 mb-4">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="text-green-400">✓</span> {f}
                      </div>
                    ))}
                    {plan.locked.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <span>🔒</span> {f}
                      </div>
                    ))}
                  </div>

                  {plan.id !== profile?.role && plan.id !== 'free' && (
                    <button className="w-full bg-[#C8A951] text-black py-2.5 rounded-xl text-xs font-semibold hover:bg-[#E2C97E] transition-colors">
                      Choisir {plan.name}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 text-center">
              Les paiements seront activés prochainement via Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}