import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'

type Pays = {
  id: string
  nom: string
  code: string
  devise: string
  drapeau: string
  region: string
}

type Actualite = {
  id: string
  titre: string
  categorie: string
  is_premium: boolean
  published_at: string
}

type Cours = {
  id: string
  nom_entreprise: string
  symbole: string
  cours: number
  variation: number
  bourses: { nom: string; code: string } | null
}

type Profile = {
  id: string
  full_name: string
  role: string
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: paysData } = await supabase
    .from('pays')
    .select('*')
    .eq('is_active', true)
    .order('nom')

  const { data: actualitesData } = await supabase
    .from('actualites')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5)

  const { data: coursData } = await supabase
    .from('cours_actions')
    .select('*, bourses(nom, code)')
    .order('date_cours', { ascending: false })
    .limit(6)

  const pays = (paysData || []) as Pays[]
  const actualites = (actualitesData || []) as Actualite[]
  const cours = (coursData || []) as Cours[]
  const p = profile as Profile | null

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* NAV */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold">
            Afrique<span className="text-[#C8A951]">Varo</span>
          </h1>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-[#C8A951] text-sm font-medium">Accueil</Link>
            <Link href="/marches" className="text-gray-500 hover:text-white text-sm transition-colors">Marchés</Link>
            <Link href="/actualites" className="text-gray-500 hover:text-white text-sm transition-colors">Actualités</Link>
            <Link href="/pays" className="text-gray-500 hover:text-white text-sm transition-colors">Pays</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            p?.role === 'premium' ? 'bg-[#C8A951]/20 text-[#C8A951]' :
            p?.role === 'pro' ? 'bg-blue-500/20 text-blue-400' :
            'bg-white/10 text-gray-400'
          }`}>
            {p?.role === 'premium' ? '⭐ Premium' :
             p?.role === 'pro' ? '🔵 Pro' : '🆓 Gratuit'}
          </span>
          <Link href="/profil" className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] text-sm font-bold">
            {p?.full_name?.charAt(0).toUpperCase()}
          </Link>
        </div>

        {/*  Nav pour ajouter le lien admin */}
        <div className="hidden md:flex items-center gap-6">
        <Link href="/dashboard" className="text-[#C8A951] text-sm font-medium">Accueil</Link>
        <Link href="/marches" className="text-gray-500 hover:text-white text-sm transition-colors">Marchés</Link>
        <Link href="/actualites" className="text-gray-500 hover:text-white text-sm transition-colors">Actualités</Link>
        <Link href="/pays" className="text-gray-500 hover:text-white text-sm transition-colors">Pays</Link>
        {p?.role === 'admin' && (
            <Link href="/admin" className="text-red-400 hover:text-red-300 text-sm transition-colors">
            🔐 Admin
            </Link>
            )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">
            Bonjour, {p?.full_name} 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Voici les dernières données économiques africaines
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pays suivis', value: pays.length, icon: '🌍', color: 'text-[#C8A951]' },
            { label: 'Bourses actives', value: 5, icon: '📈', color: 'text-green-400' },
            { label: 'Actualités', value: actualites.length, icon: '📰', color: 'text-blue-400' },
            { label: 'Cours disponibles', value: cours.length, icon: '💹', color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#141414] rounded-2xl border border-white/5 p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MARCHÉS + ACTUALITÉS */}
          <div className="lg:col-span-2 space-y-6">

            {/* MARCHÉS */}
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">📈 Marchés financiers</h3>
                <Link href="/marches" className="text-[#C8A951] text-xs hover:underline">Voir tout →</Link>
              </div>

              {cours.length > 0 ? (
                <div className="space-y-3">
                  {cours.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{c.nom_entreprise}</p>
                        <p className="text-xs text-gray-500">{c.symbole} · {c.bourses?.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {Number(c.cours).toLocaleString('fr-FR')}
                        </p>
                        <p className={`text-xs font-medium ${
                          c.variation >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {c.variation >= 0 ? '+' : ''}{Number(c.variation).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-500 text-sm">Aucun cours disponible</p>
                  <Link href="/admin" className="text-[#C8A951] text-xs mt-2 inline-block hover:underline">
                    Ajouter des données →
                  </Link>
                </div>
              )}
            </div>

            {/* ACTUALITÉS */}
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">📰 Dernières actualités</h3>
                <Link href="/actualites" className="text-[#C8A951] text-xs hover:underline">Voir tout →</Link>
              </div>

              {actualites.length > 0 ? (
                <div className="space-y-4">
                  {actualites.map((actu) => (
                    <div key={actu.id} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {actu.is_premium && (
                            <span className="text-xs bg-[#C8A951]/20 text-[#C8A951] px-1.5 py-0.5 rounded font-medium">
                              Premium
                            </span>
                          )}
                          <span className="text-xs text-gray-600 capitalize">{actu.categorie}</span>
                        </div>
                        <p className="text-sm text-white font-medium line-clamp-2">{actu.titre}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {actu.published_at
                            ? new Date(actu.published_at).toLocaleDateString('fr-FR')
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📰</div>
                  <p className="text-gray-500 text-sm">Aucune actualité publiée</p>
                  <Link href="/admin" className="text-[#C8A951] text-xs mt-2 inline-block hover:underline">
                    Ajouter une actualité →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">

            {/* PAYS */}
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">🌍 Pays africains</h3>
                <Link href="/pays" className="text-[#C8A951] text-xs hover:underline">Voir tout →</Link>
              </div>
              <div className="space-y-1">
                {pays.slice(0, 6).map((pays_item) => (
                  <Link key={pays_item.id} href={`/pays/${pays_item.code}`}>
                    <div className="flex items-center gap-3 py-2 hover:bg-white/5 rounded-xl px-2 transition-colors">
                      <span className="text-xl">{pays_item.drapeau}</span>
                      <div>
                        <p className="text-sm text-white font-medium">{pays_item.nom}</p>
                        <p className="text-xs text-gray-500">{pays_item.devise} · {pays_item.region}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* UPGRADE */}
            {p?.role === 'free' && (
              <div className="bg-gradient-to-br from-[#C8A951]/20 to-[#C8A951]/5 rounded-2xl border border-[#C8A951]/20 p-5">
                <div className="text-2xl mb-3">⭐</div>
                <h3 className="font-semibold text-white mb-2">Passer à Premium</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  {"Accède aux données en temps réel, aux rapports exclusifs et aux alertes personnalisées."}
                </p>
                <Link href="/profil/upgrade" className="block w-full bg-[#C8A951] text-black text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E2C97E] transition-colors">
                  Voir les offres
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}