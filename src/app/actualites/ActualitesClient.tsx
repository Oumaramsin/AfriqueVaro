'use client'

import { useState } from 'react'
import Link from 'next/link'

type Actualite = {
  id: string
  titre: string
  contenu: string
  resume: string
  categorie: string
  is_premium: boolean
  auteur: string
  source: string
  published_at: string
  pays: { nom: string; drapeau: string; code: string } | null
}

type Pays = { id: string; nom: string; code: string; drapeau: string }

const CATEGORIES = [
  { value: 'tout', label: 'Tout' },
  { value: 'marches', label: '📈 Marchés' },
  { value: 'macro', label: '📊 Macro' },
  { value: 'entreprises', label: '🏢 Entreprises' },
  { value: 'politique', label: '🏛️ Politique' },
  { value: 'energie', label: '⚡ Énergie' },
  { value: 'agriculture', label: '🌾 Agriculture' },
]

export default function ActualitesClient({
  actualites, pays, userRole
}: {
  actualites: Actualite[]
  pays: Pays[]
  userRole: string
}) {
  const [categorie, setCategorie] = useState('tout')
  const [paysFilter, setPaysFilter] = useState('tout')
  const [selected, setSelected] = useState<Actualite | null>(null)

  const filtered = actualites.filter(a => {
    const matchCat = categorie === 'tout' || a.categorie === categorie
    const matchPays = paysFilter === 'tout' || a.pays?.code === paysFilter
    return matchCat && matchPays
  })

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const canRead = (actu: Actualite) => !actu.is_premium || userRole === 'premium' || userRole === 'pro' || userRole === 'admin'

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
            <Link href="/actualites" className="text-[#C8A951] text-sm font-medium">Actualités</Link>
            <Link href="/pays" className="text-gray-500 hover:text-white text-sm transition-colors">Pays</Link>
          </div>
        </div>
        <Link href="/profil" className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] text-sm font-bold">
          P
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold">Actualités économiques</h2>
          <p className="text-gray-500 mt-1 text-sm">
            {"L'information économique africaine en temps réel"}
          </p>
        </div>

        {/* FILTRES */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Catégories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategorie(c.value)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  categorie === c.value
                    ? 'bg-[#C8A951] text-black font-medium'
                    : 'bg-[#141414] text-gray-400 border border-white/5 hover:border-white/10'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Filtre pays */}
          <select value={paysFilter} onChange={e => setPaysFilter(e.target.value)}
            className="px-4 py-2 rounded-full bg-[#141414] border border-white/5 text-gray-400 text-sm focus:outline-none focus:border-[#C8A951]">
            <option value="tout">🌍 Tous les pays</option>
            {pays.map(p => (
              <option key={p.id} value={p.code}>{p.drapeau} {p.nom}</option>
            ))}
          </select>
        </div>

        {selected ? (
          /* ── ARTICLE COMPLET ── */
          <div className="max-w-3xl">
            <button onClick={() => setSelected(null)}
              className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
              ← Retour aux actualités
            </button>

            <div className="bg-[#141414] rounded-2xl border border-white/5 p-8">
              {/* Badge */}
              <div className="flex items-center gap-3 mb-4">
                {selected.is_premium && (
                  <span className="text-xs bg-[#C8A951]/20 text-[#C8A951] px-2 py-1 rounded-full font-medium">
                    ⭐ Premium
                  </span>
                )}
                <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full capitalize">
                  {selected.categorie}
                </span>
                {selected.pays && (
                  <span className="text-xs text-gray-500">
                    {selected.pays.drapeau} {selected.pays.nom}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
                {selected.titre}
              </h1>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                {selected.auteur && (
                  <span className="text-sm text-gray-400">
                    ✍️ {selected.auteur}
                  </span>
                )}
                {selected.source && (
                  <span className="text-sm text-gray-500">
                    Source : {selected.source}
                  </span>
                )}
                <span className="text-sm text-gray-600 ml-auto">
                  {formatDate(selected.published_at)}
                </span>
              </div>

              {canRead(selected) ? (
                <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {selected.contenu}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Contenu réservé aux abonnés Premium
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Accède à tous les articles premium et aux données exclusives.
                  </p>
                  <Link href="/profil/upgrade"
                    className="bg-[#C8A951] text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors">
                    Passer à Premium
                  </Link>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── LISTE ARTICLES ── */
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📰</div>
                <p className="text-gray-500">Aucune actualité pour ces filtres</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(actu => (
                  <div key={actu.id}
                    onClick={() => setSelected(actu)}
                    className="bg-[#141414] rounded-2xl border border-white/5 p-5 cursor-pointer hover:border-white/10 transition-all hover:bg-[#181818] group">

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      {actu.is_premium && (
                        <span className="text-xs bg-[#C8A951]/20 text-[#C8A951] px-2 py-0.5 rounded-full font-medium">
                          ⭐ Premium
                        </span>
                      )}
                      <span className="text-xs text-gray-600 capitalize bg-white/5 px-2 py-0.5 rounded-full">
                        {actu.categorie}
                      </span>
                      {actu.pays && (
                        <span className="text-xs text-gray-600 ml-auto">
                          {actu.pays.drapeau}
                        </span>
                      )}
                    </div>

                    {/* Titre */}
                    <h3 className="font-semibold text-white leading-snug mb-2 group-hover:text-[#C8A951] transition-colors line-clamp-3">
                      {actu.titre}
                    </h3>

                    {/* Résumé */}
                    {actu.resume && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {actu.resume}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-600">
                        {formatDate(actu.published_at)}
                      </span>
                      {!canRead(actu) && (
                        <span className="text-xs text-[#C8A951]">🔒 Premium</span>
                      )}
                      {canRead(actu) && (
                        <span className="text-xs text-gray-600 group-hover:text-[#C8A951] transition-colors">
                          Lire →
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}