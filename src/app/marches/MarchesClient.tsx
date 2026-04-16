'use client'

import { useState } from 'react'
import Link from 'next/link'

type Bourse = {
  id: string
  nom: string
  code: string
  devise: string
  description: string
}

type Cours = {
  id: string
  bourse_id: string
  symbole: string
  nom_entreprise: string
  cours: number
  variation: number
  volume: number
  date_cours: string
  bourses: { nom: string; code: string; devise: string } | null
}

type Taux = {
  id: string
  devise_base: string
  devise_cible: string
  taux: number
  date_taux: string
  source: string
}

export default function MarchesClient({
  bourses, cours, taux
}: {
  bourses: Bourse[]
  cours: Cours[]
  taux: Taux[]
}) {
  const [bourseActive, setBourseActive] = useState<string>('tout')
  const [search, setSearch] = useState('')

  const coursFiltres = cours.filter(c => {
    const matchBourse = bourseActive === 'tout' || c.bourse_id === bourseActive
    const matchSearch = search === '' ||
      c.nom_entreprise.toLowerCase().includes(search.toLowerCase()) ||
      c.symbole.toLowerCase().includes(search.toLowerCase())
    return matchBourse && matchSearch
  })

  // Déduplique — garde le cours le plus récent par symbole
  const coursUniques = coursFiltres.reduce((acc, c) => {
    if (!acc.find(x => x.symbole === c.symbole && x.bourse_id === c.bourse_id)) {
      acc.push(c)
    }
    return acc
  }, [] as Cours[])

  const hausses = coursUniques.filter(c => c.variation > 0).length
  const baisses = coursUniques.filter(c => c.variation < 0).length
  const stables = coursUniques.filter(c => c.variation === 0).length

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
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
            <Link href="/marches" className="text-[#C8A951] text-sm font-medium">Marchés</Link>
            <Link href="/actualites" className="text-gray-500 hover:text-white text-sm transition-colors">Actualités</Link>
            <Link href="/pays" className="text-gray-500 hover:text-white text-sm transition-colors">Pays</Link>
          </div>
        </div>
        <Link href="/profil" className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] text-sm font-bold">
          P
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Marchés financiers</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Bourses africaines — cours et indices
          </p>
        </div>

        {/* STATS MARCHÉ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">Valeurs suivies</p>
            <p className="text-2xl font-bold text-white">{coursUniques.length}</p>
          </div>
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">En hausse</p>
            <p className="text-2xl font-bold text-green-400">▲ {hausses}</p>
          </div>
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">En baisse</p>
            <p className="text-2xl font-bold text-red-400">▼ {baisses}</p>
          </div>
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">Stables</p>
            <p className="text-2xl font-bold text-gray-400">— {stables}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* SIDEBAR BOURSES */}
          <div className="space-y-4">
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-4">
              <h3 className="font-semibold text-white text-sm mb-3">Bourses</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setBourseActive('tout')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                    bourseActive === 'tout'
                      ? 'bg-[#C8A951]/15 text-[#C8A951]'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  🌍 Toutes les bourses
                </button>
                {bourses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBourseActive(b.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      bourseActive === b.id
                        ? 'bg-[#C8A951]/15 text-[#C8A951]'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-medium">{b.code}</span>
                    <span className="text-xs text-gray-600 ml-2">{b.devise}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAUX DE CHANGE */}
            {taux.length > 0 && (
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-4">
                <h3 className="font-semibold text-white text-sm mb-3">💱 Taux de change</h3>
                <div className="space-y-3">
                  {taux.slice(0, 6).map(t => (
                    <div key={t.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">
                          {t.devise_base}/{t.devise_cible}
                        </p>
                        <p className="text-xs text-gray-600">{formatDate(t.date_taux)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#C8A951]">
                        {Number(t.taux).toFixed(4)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TABLE COURS */}
          <div className="lg:col-span-3">
            {/* Recherche */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher une valeur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm"
              />
            </div>

            {coursUniques.length === 0 ? (
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-12 text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-500 text-sm">Aucun cours disponible</p>
                <Link href="/admin" className="text-[#C8A951] text-xs mt-2 inline-block hover:underline">
                  Ajouter des données →
                </Link>
              </div>
            ) : (
              <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                {/* Header table */}
                <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                  <span className="col-span-2">Valeur</span>
                  <span className="text-right">Cours</span>
                  <span className="text-right">Variation</span>
                  <span className="text-right">Volume</span>
                </div>

                {/* Lignes */}
                <div className="divide-y divide-white/5">
                  {coursUniques.map(c => (
                    <div key={c.id} className="grid grid-cols-5 px-5 py-4 hover:bg-white/3 transition-colors">
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-white">{c.nom_entreprise}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{c.symbole}</span>
                          <span className="text-xs text-gray-700">·</span>
                          <span className="text-xs text-gray-600">{c.bourses?.code}</span>
                          <span className="text-xs text-gray-700">·</span>
                          <span className="text-xs text-gray-600">{formatDate(c.date_cours)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {Number(c.cours).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-600">{c.bourses?.devise}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          c.variation > 0 ? 'text-green-400' :
                          c.variation < 0 ? 'text-red-400' : 'text-gray-500'
                        }`}>
                          {c.variation > 0 ? '▲' : c.variation < 0 ? '▼' : '—'}
                          {Math.abs(c.variation).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {c.volume ? Number(c.volume).toLocaleString('fr-FR') : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}