'use client'

import { useState } from 'react'
import Link from 'next/link'

type Pays = {
  id: string
  nom: string
  code: string
  devise: string
  drapeau: string
  region: string
}

type Macro = {
  id: string
  pays_id: string
  indicateur: string
  valeur: number
  unite: string
  annee: number
  source: string
  pays: { nom: string; drapeau: string; code: string } | null
}

const REGIONS = [
  'Tout',
  'Afrique de l\'Ouest',
  'Afrique Centrale',
  'Afrique de l\'Est',
  'Afrique Australe',
  'Afrique du Nord',
]

export default function PaysClient({
  pays, macro
}: {
  pays: Pays[]
  macro: Macro[]
}) {
  const [region, setRegion] = useState('Tout')
  const [selected, setSelected] = useState<Pays | null>(null)

  const paysFiltres = pays.filter(p =>
    region === 'Tout' || p.region === region
  )

  const getMacro = (paysId: string) =>
    macro.filter(m => m.pays_id === paysId)

  const getIndicateur = (paysId: string, indicateur: string) => {
    const data = macro.find(m => m.pays_id === paysId && m.indicateur === indicateur)
    return data ? `${Number(data.valeur).toLocaleString('fr-FR')} ${data.unite}` : '—'
  }

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
            <Link href="/pays" className="text-[#C8A951] text-sm font-medium">Pays</Link>
          </div>
        </div>
        <Link href="/profil" className="w-8 h-8 rounded-full bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] text-sm font-bold">
          P
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {selected ? (
          /* ── FICHE PAYS ── */
          <div>
            <button onClick={() => setSelected(null)}
              className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
              ← Retour aux pays
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Infos pays */}
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
                <div className="text-6xl mb-4">{selected.drapeau}</div>
                <h2 className="text-2xl font-bold text-white mb-1">{selected.nom}</h2>
                <p className="text-gray-500 text-sm mb-4">{selected.region}</p>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-xs text-gray-500">Code</span>
                    <span className="text-xs text-white font-medium">{selected.code}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-xs text-gray-500">Devise</span>
                    <span className="text-xs text-white font-medium">{selected.devise}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-xs text-gray-500">Région</span>
                    <span className="text-xs text-white font-medium">{selected.region}</span>
                  </div>
                </div>
              </div>

              {/* Données macro */}
              <div className="lg:col-span-2">
                <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
                  <h3 className="font-semibold text-white mb-4">
                    📊 Données macro-économiques
                  </h3>

                  {getMacro(selected.id).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">📈</div>
                      <p className="text-gray-500 text-sm">
                        Aucune donnée disponible pour ce pays
                      </p>
                      <Link href="/admin" className="text-[#C8A951] text-xs mt-2 inline-block hover:underline">
                        Ajouter des données →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {getMacro(selected.id).map(m => (
                        <div key={m.id} className="bg-white/3 rounded-xl p-4 border border-white/5">
                          <p className="text-xs text-gray-500 mb-1">{m.indicateur}</p>
                          <p className="text-lg font-bold text-white">
                            {Number(m.valeur).toLocaleString('fr-FR')}
                            <span className="text-sm text-gray-500 ml-1 font-normal">{m.unite}</span>
                          </p>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-gray-600">{m.annee}</span>
                            {m.source && <span className="text-xs text-gray-600">{m.source}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Indicateurs clés */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {[
                    { label: 'PIB', key: 'PIB' },
                    { label: 'Inflation', key: 'Inflation' },
                    { label: 'Chômage', key: 'Chomage' },
                  ].map(ind => (
                    <div key={ind.key} className="bg-[#141414] rounded-2xl border border-white/5 p-4 text-center">
                      <p className="text-xs text-gray-500 mb-2">{ind.label}</p>
                      <p className="text-lg font-bold text-[#C8A951]">
                        {getIndicateur(selected.id, ind.key)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* ── LISTE PAYS ── */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Pays africains</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Données économiques par pays
              </p>
            </div>

            {/* Filtre région */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
              {REGIONS.map(r => (
                <button key={r} onClick={() => setRegion(r)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                    region === r
                      ? 'bg-[#C8A951] text-black font-medium'
                      : 'bg-[#141414] text-gray-400 border border-white/5 hover:border-white/10'
                  }`}>
                  {r}
                </button>
              ))}
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Pays couverts', value: pays.length, icon: '🌍' },
                { label: 'Afrique Ouest', value: pays.filter(p => p.region === "Afrique de l'Ouest").length, icon: '🇸🇳' },
                { label: 'Afrique Est', value: pays.filter(p => p.region === "Afrique de l'Est").length, icon: '🇰🇪' },
                { label: 'Données macro', value: macro.length, icon: '📊' },
              ].map((s, i) => (
                <div key={i} className="bg-[#141414] rounded-2xl border border-white/5 p-4">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-[#C8A951]">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Grille pays */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paysFiltres.map(p => (
                <div key={p.id} onClick={() => setSelected(p)}
                  className="bg-[#141414] rounded-2xl border border-white/5 p-5 cursor-pointer hover:border-[#C8A951]/30 hover:bg-[#181818] transition-all group">
                  <div className="text-4xl mb-3">{p.drapeau}</div>
                  <h3 className="font-semibold text-white group-hover:text-[#C8A951] transition-colors">
                    {p.nom}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{p.devise}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{p.region}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-xs text-gray-600">
                      {getMacro(p.id).length} données
                    </span>
                    <span className="text-xs text-[#C8A951] opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}