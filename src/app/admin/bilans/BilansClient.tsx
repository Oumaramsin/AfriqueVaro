'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Societe = {
  id: string
  nom: string
  symbole: string | null
  bourses: { code: string } | null
}

type Bilan = {
  id: string
  societe_id: string
  exercice: number
  exercice_precedent?: number
  devise: string
  statut: string
  created_at: string
  societes?: { nom: string; symbole: string | null } | null
}

type BilanLigne = {
  id: string
  bilan_id: string
  cote: 'actif' | 'passif'
  categorie: string
  libelle: string
  brut: number
  amorts_deprec: number
  brut_precedent: number
  amorts_deprec_precedent: number
  ordre: number
  is_total: boolean
  is_categorie: boolean
}

const STRUCTURE_ACTIF = [
  { libelle: 'IMMOBILISATIONS INCORPORELLES', is_categorie: true, is_total: false },
  { libelle: 'Frais de développement et de prospection', is_categorie: false, is_total: false },
  { libelle: 'Brevets, licences, logiciels et droits similaires', is_categorie: false, is_total: false },
  { libelle: 'Fonds commercial et droit au bail', is_categorie: false, is_total: false },
  { libelle: 'Autres immobilisations incorporelles', is_categorie: false, is_total: false },
  { libelle: 'IMMOBILISATIONS CORPORELLES', is_categorie: true, is_total: false },
  { libelle: 'Terrains', is_categorie: false, is_total: false },
  { libelle: 'Bâtiments', is_categorie: false, is_total: false },
  { libelle: 'Aménagements, agencements et installations', is_categorie: false, is_total: false },
  { libelle: 'Matériel, mobilier et actifs biologiques', is_categorie: false, is_total: false },
  { libelle: 'Matériel de transport', is_categorie: false, is_total: false },
  { libelle: 'Avances & acomptes versés sur immobilisations', is_categorie: false, is_total: false },
  { libelle: 'IMMOBILISATIONS FINANCIÈRES', is_categorie: true, is_total: false },
  { libelle: 'Titres de participation', is_categorie: false, is_total: false },
  { libelle: 'Autres immobilisations financières', is_categorie: false, is_total: false },
  { libelle: 'TOTAL ACTIF IMMOBILISÉ', is_categorie: false, is_total: true },
  { libelle: 'ACTIF CIRCULANT H.A.O.', is_categorie: true, is_total: false },
  { libelle: 'STOCKS ET ENCOURS', is_categorie: true, is_total: false },
  { libelle: 'Marchandises', is_categorie: false, is_total: false },
  { libelle: 'Matières premières et autres approvisionnements', is_categorie: false, is_total: false },
  { libelle: 'En-cours de production', is_categorie: false, is_total: false },
  { libelle: 'Produits fabriqués', is_categorie: false, is_total: false },
  { libelle: 'CRÉANCES ET EMPLOIS ASSIMILÉS', is_categorie: true, is_total: false },
  { libelle: 'Fournisseurs, avances versées', is_categorie: false, is_total: false },
  { libelle: 'Clients', is_categorie: false, is_total: false },
  { libelle: 'Autres créances', is_categorie: false, is_total: false },
  { libelle: 'TOTAL ACTIF CIRCULANT', is_categorie: false, is_total: true },
  { libelle: 'TRÉSORERIE - ACTIF', is_categorie: true, is_total: false },
  { libelle: 'Titres de placement', is_categorie: false, is_total: false },
  { libelle: 'Valeurs à encaisser', is_categorie: false, is_total: false },
  { libelle: 'Banques, chèques postaux, caisse et assimilés', is_categorie: false, is_total: false },
  { libelle: 'TOTAL TRÉSORERIE - ACTIF', is_categorie: false, is_total: true },
  { libelle: 'Écarts de conversion - Actif', is_categorie: false, is_total: false },
  { libelle: 'TOTAL ACTIFS', is_categorie: false, is_total: true },
]

const STRUCTURE_PASSIF = [
  { libelle: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES', is_categorie: true, is_total: false },
  { libelle: 'Capital', is_categorie: false, is_total: false },
  { libelle: 'Actionnaires, capital souscrit non appelé (-)', is_categorie: false, is_total: false },
  { libelle: 'Primes liées au capital social', is_categorie: false, is_total: false },
  { libelle: 'Écarts de réévaluation', is_categorie: false, is_total: false },
  { libelle: 'Réserves indisponibles', is_categorie: false, is_total: false },
  { libelle: 'Réserves libres', is_categorie: false, is_total: false },
  { libelle: "Report à nouveau (+ou-)", is_categorie: false, is_total: false },
  { libelle: "Résultat net de l'exercice (+ou-)", is_categorie: false, is_total: false },
  { libelle: 'Autres capitaux propres', is_categorie: false, is_total: false },
  { libelle: 'TOTAL CAPITAUX PROPRES', is_categorie: false, is_total: true },
  { libelle: 'DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES', is_categorie: true, is_total: false },
  { libelle: 'Emprunts obligataires', is_categorie: false, is_total: false },
  { libelle: 'Emprunts auprès des établissements de crédit', is_categorie: false, is_total: false },
  { libelle: 'Dettes de location-acquisition', is_categorie: false, is_total: false },
  { libelle: 'Provisions financières pour risques et charges', is_categorie: false, is_total: false },
  { libelle: 'TOTAL DETTES FINANCIÈRES', is_categorie: false, is_total: true },
  { libelle: 'TOTAL RESSOURCES STABLES', is_categorie: false, is_total: true },
  { libelle: 'PASSIF CIRCULANT H.A.O.', is_categorie: true, is_total: false },
  { libelle: 'DETTES CIRCULANTES', is_categorie: true, is_total: false },
  { libelle: 'Clients, avances reçues', is_categorie: false, is_total: false },
  { libelle: "Fournisseurs d'exploitation", is_categorie: false, is_total: false },
  { libelle: 'Dettes fiscales', is_categorie: false, is_total: false },
  { libelle: 'Dettes sociales', is_categorie: false, is_total: false },
  { libelle: 'Autres dettes', is_categorie: false, is_total: false },
  { libelle: 'TOTAL DETTES CIRCULANTES', is_categorie: false, is_total: true },
  { libelle: 'TRÉSORERIE - PASSIF', is_categorie: true, is_total: false },
  { libelle: "Banques, crédits d'escompte", is_categorie: false, is_total: false },
  { libelle: 'Banques, établissements financiers et crédits de trésorerie', is_categorie: false, is_total: false },
  { libelle: 'TOTAL TRÉSORERIE - PASSIF', is_categorie: false, is_total: true },
  { libelle: 'Écarts de conversion - Passif', is_categorie: false, is_total: false },
  { libelle: 'TOTAL PASSIFS', is_categorie: false, is_total: true },
]

export default function BilansClient({
  societes: societesData,
  bilans: bilansData,
}: {
  societes: unknown[]
  bilans: unknown[]
}) {
  const supabase = createClient()
  const [bilans, setBilans] = useState<Bilan[]>(bilansData as Bilan[])
  const societesList = societesData as Societe[]
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedBilan, setSelectedBilan] = useState<Bilan | null>(null)
  const [lignes, setLignes] = useState<BilanLigne[]>([])
  const [loadingLignes, setLoadingLignes] = useState(false)
  const [view, setView] = useState<'liste' | 'nouveau' | 'saisie'>('liste')
  const [activeCote, setActiveCote] = useState<'actif' | 'passif'>('actif')

  const [bilanForm, setBilanForm] = useState({
    societe_id: '',
    exercice: new Date().getFullYear().toString(),
    exercice_precedent: (new Date().getFullYear() - 1).toString(),
    devise: 'XOF',
  })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleCreateBilan = async () => {
    if (!bilanForm.societe_id || !bilanForm.exercice) {
      setError('Société et exercice requis')
      return
    }
    setLoading(true)
    setError(null)

    const { data: bilan, error: bilanError } = await supabase
      .from('bilans')
      .insert({
        societe_id: bilanForm.societe_id,
        exercice: parseInt(bilanForm.exercice),
        exercice_precedent: parseInt(bilanForm.exercice_precedent),
        devise: bilanForm.devise,
        statut: 'brouillon',
      })
      .select()
      .single()

    if (bilanError) {
      setError(bilanError.message)
      setLoading(false)
      return
    }

    // Crée toutes les lignes ACTIF
    const lignesActif = STRUCTURE_ACTIF.map((item, i) => ({
      bilan_id: bilan.id,
      cote: 'actif' as const,
      categorie: 'actif',
      libelle: item.libelle,
      brut: 0,
      amorts_deprec: 0,
      brut_precedent: 0,
      amorts_deprec_precedent: 0,
      ordre: i,
      is_total: item.is_total,
      is_categorie: item.is_categorie,
    }))

    // Crée toutes les lignes PASSIF
    const lignesPassif = STRUCTURE_PASSIF.map((item, i) => ({
      bilan_id: bilan.id,
      cote: 'passif' as const,
      categorie: 'passif',
      libelle: item.libelle,
      brut: 0,
      amorts_deprec: 0,
      brut_precedent: 0,
      amorts_deprec_precedent: 0,
      ordre: i,
      is_total: item.is_total,
      is_categorie: item.is_categorie,
    }))

    await supabase.from('bilan_lignes').insert([...lignesActif, ...lignesPassif])

    // Récupère le nom depuis societesList en mémoire
    const societe = societesList.find((s: Societe) => s.id === bilanForm.societe_id)

    const bilanAvecSociete: Bilan = {
      ...bilan,
      societes: societe
        ? { nom: societe.nom, symbole: societe.symbole }
        : null
    }

    setBilans(prev => {
      const exists = prev.find(b => b.id === bilanAvecSociete.id)
      if (exists) return prev
      return [bilanAvecSociete, ...prev]
    })

    showSuccess('Bilan OHADA créé avec succès !')
    setView('liste')
    setBilanForm({
      societe_id: '',
      exercice: new Date().getFullYear().toString(),
      exercice_precedent: (new Date().getFullYear() - 1).toString(),
      devise: 'XOF',
    })
    setLoading(false)
  }

  const handleOpenBilan = async (bilan: Bilan) => {
    setSelectedBilan(bilan)
    setLoadingLignes(true)
    setView('saisie')

    const { data } = await supabase
      .from('bilan_lignes')
      .select('*')
      .eq('bilan_id', bilan.id)
      .order('cote')
      .order('ordre')

    setLignes(data || [])
    setLoadingLignes(false)
  }

  const handleUpdateLigne = (
    id: string,
    field: 'brut' | 'amorts_deprec' | 'brut_precedent' | 'amorts_deprec_precedent',
    value: string
  ) => {
    setLignes(prev => prev.map(l =>
      l.id === id ? { ...l, [field]: parseFloat(value) || 0 } : l
    ))
  }

  const getNET = (ligne: BilanLigne) => ligne.brut - ligne.amorts_deprec
  const getNETPrecedent = (ligne: BilanLigne) => ligne.brut_precedent - ligne.amorts_deprec_precedent

  const handleSaveLignes = async () => {
    setLoading(true)
    setError(null)
    const updates = lignes.map(l =>
      supabase.from('bilan_lignes').update({
        brut: l.brut,
        amorts_deprec: l.amorts_deprec,
        brut_precedent: l.brut_precedent,
        amorts_deprec_precedent: l.amorts_deprec_precedent,
      }).eq('id', l.id)
    )
    await Promise.all(updates)
    showSuccess('Bilan sauvegardé !')
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!selectedBilan) return
    await handleSaveLignes()
    await supabase.from('bilans').update({ statut: 'publie' }).eq('id', selectedBilan.id)
    setBilans(prev => prev.map(b => b.id === selectedBilan.id ? { ...b, statut: 'publie' } : b))
    setSelectedBilan(prev => prev ? { ...prev, statut: 'publie' } : null)
    showSuccess('Bilan publié !')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce bilan ?')) return
    await supabase.from('bilans').delete().eq('id', id)
    setBilans(prev => prev.filter(b => b.id !== id))
    showSuccess('Bilan supprimé !')
  }

  // ── Calculs sections ──
  const getSection = (cote: 'actif' | 'passif', libelleTotal: string) => {
    const totalIndex = lignes.findIndex(l => l.cote === cote && l.libelle === libelleTotal)
    if (totalIndex === -1) return []
    let startIndex = 0
    for (let i = totalIndex - 1; i >= 0; i--) {
      if (lignes[i].is_total && lignes[i].cote === cote) { startIndex = i + 1; break }
    }
    return lignes.slice(startIndex, totalIndex).filter(l => !l.is_total && !l.is_categorie && l.cote === cote)
  }

  const getBrutSection = (cote: 'actif' | 'passif', libelleTotal: string) =>
    getSection(cote, libelleTotal).reduce((sum, l) => sum + (l.brut || 0), 0)

  const getAmortsSection = (cote: 'actif' | 'passif', libelleTotal: string) =>
    getSection(cote, libelleTotal).reduce((sum, l) => sum + (l.amorts_deprec || 0), 0)

  const getBrutSectionPrecedent = (cote: 'actif' | 'passif', libelleTotal: string) =>
    getSection(cote, libelleTotal).reduce((sum, l) => sum + (l.brut_precedent || 0), 0)

  const getAmortsSectionPrecedent = (cote: 'actif' | 'passif', libelleTotal: string) =>
    getSection(cote, libelleTotal).reduce((sum, l) => sum + (l.amorts_deprec_precedent || 0), 0)

  const getTotalSection = (cote: 'actif' | 'passif', libelleTotal: string) =>
    getSection(cote, libelleTotal).reduce((sum, l) => sum + getNET(l), 0)

  const getTotalSectionPrecedent = (cote: 'actif' | 'passif', libelleTotal: string) =>
    getSection(cote, libelleTotal).reduce((sum, l) => sum + getNETPrecedent(l), 0)

  const getLignesBase = (cote: 'actif' | 'passif') =>
    lignes.filter(l => l.cote === cote && !l.is_total && !l.is_categorie)

  const getTotalNet = (cote: 'actif' | 'passif') =>
    getLignesBase(cote).reduce((sum, l) => sum + getNET(l), 0)

  const getTotalNetPrecedent = (cote: 'actif' | 'passif') =>
    getLignesBase(cote).reduce((sum, l) => sum + getNETPrecedent(l), 0)

  const getTotalBrut = (cote: 'actif' | 'passif') =>
    getLignesBase(cote).reduce((sum, l) => sum + (l.brut || 0), 0)

  const getTotalAmorts = (cote: 'actif' | 'passif') =>
    getLignesBase(cote).reduce((sum, l) => sum + (l.amorts_deprec || 0), 0)

  const getTotalBrutPrecedent = (cote: 'actif' | 'passif') =>
    getLignesBase(cote).reduce((sum, l) => sum + (l.brut_precedent || 0), 0)

  const getTotalAmortsPrecedent = (cote: 'actif' | 'passif') =>
    getLignesBase(cote).reduce((sum, l) => sum + (l.amorts_deprec_precedent || 0), 0)

  const formatNum = (n: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Math.round(n))

  const currentLignes = lignes.filter(l => l.cote === activeCote)

  const isTotal = (ligne: BilanLigne) => ligne.is_total
  const isFinalTotal = (ligne: BilanLigne) =>
    ligne.libelle === 'TOTAL ACTIFS' || ligne.libelle === 'TOTAL PASSIFS'

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* NAV */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-white text-sm transition-colors">
            ← Admin
          </Link>
          <h1 className="text-lg font-bold">
            Afrique<span className="text-[#C8A951]">Varo</span>
            <span className="text-gray-600 font-normal ml-2 text-sm">/ Bilans OHADA</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {view === 'saisie' && (
            <button onClick={() => setView('liste')} className="text-gray-500 hover:text-white text-sm">
              ← Retour
            </button>
          )}
          <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full">🔐 Zone Admin</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 mb-6 text-sm">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ── LISTE ── */}
        {view === 'liste' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">📊 Bilans OHADA</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {bilans.length} bilan{bilans.length > 1 ? 's' : ''} enregistré{bilans.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setView('nouveau')}
                className="bg-[#C8A951] text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors"
              >
                + Nouveau bilan
              </button>
            </div>

            {bilans.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] rounded-2xl border border-white/5">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-500">Aucun bilan enregistré</p>
                <button
                  onClick={() => setView('nouveau')}
                  className="mt-4 bg-[#C8A951] text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors"
                >
                  Créer le premier bilan
                </button>
              </div>
            ) : (
              <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {bilans.map(bilan => (
                    <div key={bilan.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#C8A951]/10 flex items-center justify-center text-[#C8A951] font-bold text-sm">
                          {bilan.exercice}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {bilan.societes?.nom || '—'}
                            {bilan.societes?.symbole && (
                              <span className="ml-2 text-xs text-[#C8A951]">({bilan.societes.symbole})</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Exercice {bilan.exercice} · {bilan.devise}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          bilan.statut === 'publie'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {bilan.statut === 'publie' ? '✓ Publié' : '✏️ Brouillon'}
                        </span>
                        <button
                          onClick={() => handleOpenBilan(bilan)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#C8A951]/10 text-[#C8A951] hover:bg-[#C8A951]/20 transition-colors"
                        >
                          Saisir les montants
                        </button>
                        <button
                          onClick={() => handleDelete(bilan.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── NOUVEAU BILAN ── */}
        {view === 'nouveau' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setView('liste')} className="text-gray-500 hover:text-white text-sm">
                ← Retour
              </button>
              <h2 className="text-xl font-bold">Nouveau bilan OHADA</h2>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Société *</label>
                <select
                  value={bilanForm.societe_id}
                  onChange={e => setBilanForm(p => ({ ...p, societe_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#C8A951] text-sm"
                >
                  <option value="">Sélectionner une société</option>
                  {societesList.map((s: Societe) => (
                    <option key={s.id} value={s.id}>
                      {s.nom} {s.symbole ? `(${s.symbole})` : ''} — {s.bourses?.code || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Exercice N *</label>
                  <input
                    type="number"
                    placeholder="Ex: 2023"
                    value={bilanForm.exercice}
                    onChange={e => setBilanForm(p => ({ ...p, exercice: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Exercice N-1</label>
                  <input
                    type="number"
                    placeholder="Ex: 2022"
                    value={bilanForm.exercice_precedent}
                    onChange={e => setBilanForm(p => ({ ...p, exercice_precedent: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Devise</label>
                <select
                  value={bilanForm.devise}
                  onChange={e => setBilanForm(p => ({ ...p, devise: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#C8A951] text-sm"
                >
                  <option value="XOF">XOF — Franc CFA Ouest</option>
                  <option value="XAF">XAF — Franc CFA Central</option>
                  <option value="NGN">NGN — Naira nigérian</option>
                  <option value="ZAR">ZAR — Rand sud-africain</option>
                  <option value="KES">KES — Shilling kenyan</option>
                  <option value="GHS">GHS — Cedi ghanéen</option>
                  <option value="MAD">MAD — Dirham marocain</option>
                  <option value="USD">USD — Dollar américain</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>

              <div className="bg-[#C8A951]/5 border border-[#C8A951]/20 rounded-xl p-4">
                <p className="text-xs text-[#C8A951] font-medium mb-1">📋 Structure OHADA</p>
                <p className="text-xs text-gray-400">
                  Le bilan sera créé avec la structure OHADA complète : Brut / Amortissements & Dépréciations / Net
                  pour chaque poste, avec colonne N et N-1.
                </p>
              </div>

              <button
                onClick={handleCreateBilan}
                disabled={loading}
                className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer le bilan OHADA'}
              </button>
            </div>
          </div>
        )}

        {/* ── SAISIE MONTANTS ── */}
        {view === 'saisie' && selectedBilan && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedBilan.societes?.nom || '—'}
                  {selectedBilan.societes?.symbole && (
                    <span className="ml-2 text-sm text-[#C8A951]">({selectedBilan.societes.symbole})</span>
                  )}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Exercice {selectedBilan.exercice} · {selectedBilan.devise}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveLignes}
                  disabled={loading}
                  className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                {selectedBilan.statut !== 'publie' && (
                  <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="bg-[#C8A951] text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
                  >
                    🚀 Publier
                  </button>
                )}
              </div>
            </div>

            {/* Totaux */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-xs text-blue-400 mb-1">TOTAL ACTIFS (NET)</p>
                <p className="text-xl font-bold text-white">
                  {formatNum(getTotalNet('actif'))}
                  <span className="text-xs text-gray-500 ml-2">{selectedBilan.devise}</span>
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-xs text-green-400 mb-1">TOTAL PASSIFS</p>
                <p className="text-xl font-bold text-white">
                  {formatNum(getTotalNet('passif'))}
                  <span className="text-xs text-gray-500 ml-2">{selectedBilan.devise}</span>
                </p>
              </div>
            </div>

            {/* Alerte déséquilibre */}
            {getTotalNet('actif') !== getTotalNet('passif') && getTotalNet('actif') > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">
                  ⚠️ Bilan déséquilibré — Écart : {formatNum(Math.abs(getTotalNet('actif') - getTotalNet('passif')))} {selectedBilan.devise}
                </p>
              </div>
            )}

            {/* Toggle Actif / Passif */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveCote('actif')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCote === 'actif'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-[#141414] text-gray-400 border border-white/5'
                }`}
              >
                📋 ACTIF ({lignes.filter(l => l.cote === 'actif').length} postes)
              </button>
              <button
                onClick={() => setActiveCote('passif')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCote === 'passif'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[#141414] text-gray-400 border border-white/5'
                }`}
              >
                📋 PASSIF ({lignes.filter(l => l.cote === 'passif').length} postes)
              </button>
            </div>

            {/* Tableau OHADA */}
            {loadingLignes ? (
              <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
              <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">

                {/* En-tête */}
                <div className="grid grid-cols-12 gap-0 border-b border-white/10 bg-[#1a1a1a]">
                  <div className="col-span-4 px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-medium">
                    POSTES {activeCote.toUpperCase()}
                  </div>
                  <div className="col-span-4 border-l border-white/5">
                    <div className="px-4 py-1.5 text-xs text-[#C8A951] font-medium text-center border-b border-white/5">
                      {selectedBilan.exercice} (N)
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="px-2 py-1.5 text-xs text-gray-500 text-center">Brut</div>
                      <div className="px-2 py-1.5 text-xs text-gray-500 text-center border-l border-white/5">Amort/Dép.</div>
                      <div className="px-2 py-1.5 text-xs text-gray-500 text-center border-l border-white/5 font-semibold">Net</div>
                    </div>
                  </div>
                  <div className="col-span-4 border-l border-white/5">
                    <div className="px-4 py-1.5 text-xs text-gray-400 font-medium text-center border-b border-white/5">
                      {selectedBilan.exercice_precedent || selectedBilan.exercice - 1} (N-1)
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="px-2 py-1.5 text-xs text-gray-500 text-center">Brut</div>
                      <div className="px-2 py-1.5 text-xs text-gray-500 text-center border-l border-white/5">Amort/Dép.</div>
                      <div className="px-2 py-1.5 text-xs text-gray-500 text-center border-l border-white/5 font-semibold">Net</div>
                    </div>
                  </div>
                </div>

                {/* Lignes */}
                {currentLignes.map(ligne => (
                  <div
                    key={ligne.id}
                    className={`grid grid-cols-12 gap-0 border-b border-white/5 ${
                      ligne.is_categorie
                        ? 'bg-[#1e1e1e]'
                        : isTotal(ligne)
                        ? activeCote === 'actif' ? 'bg-blue-500/5' : 'bg-green-500/5'
                        : 'hover:bg-white/2'
                    }`}
                  >
                    {/* Libellé */}
                    <div className="col-span-4 px-4 py-2 flex items-center">
                      <span className={`text-xs ${
                        ligne.is_categorie
                          ? 'text-[#C8A951] font-semibold uppercase tracking-wide'
                          : isTotal(ligne)
                          ? activeCote === 'actif' ? 'text-blue-400 font-bold' : 'text-green-400 font-bold'
                          : 'text-gray-300 pl-3'
                      }`}>
                        {ligne.libelle}
                      </span>
                    </div>

                    {/* N — Brut */}
                    <div className="col-span-1 border-l border-white/5 flex items-center">
                      {!ligne.is_categorie && (
                        isTotal(ligne) ? (
                          <span className={`w-full px-2 py-2 text-xs text-right font-mono ${
                            activeCote === 'actif' ? 'text-blue-300' : 'text-green-300'
                          }`}>
                            {isFinalTotal(ligne)
                              ? formatNum(getTotalBrut(ligne.cote))
                              : formatNum(getBrutSection(ligne.cote, ligne.libelle))
                            }
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={ligne.brut || ''}
                            onChange={e => handleUpdateLigne(ligne.id, 'brut', e.target.value)}
                            className="w-full px-2 py-2 text-xs text-right font-mono bg-transparent border-0 outline-none focus:bg-white/5 text-gray-300 transition-colors"
                            placeholder="0"
                          />
                        )
                      )}
                    </div>

                    {/* N — Amorts */}
                    <div className="col-span-1 border-l border-white/5 flex items-center">
                      {!ligne.is_categorie && (
                        isTotal(ligne) ? (
                          <span className="w-full px-2 py-2 text-xs text-right font-mono text-red-400/70">
                            {isFinalTotal(ligne)
                              ? formatNum(getTotalAmorts(ligne.cote))
                              : formatNum(getAmortsSection(ligne.cote, ligne.libelle))
                            }
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={ligne.amorts_deprec || ''}
                            onChange={e => handleUpdateLigne(ligne.id, 'amorts_deprec', e.target.value)}
                            className="w-full px-2 py-2 text-xs text-right font-mono bg-transparent border-0 outline-none focus:bg-white/5 text-red-400/70 transition-colors"
                            placeholder="0"
                          />
                        )
                      )}
                    </div>

                    {/* N — Net */}
                    <div className={`col-span-2 border-l border-white/5 flex items-center justify-end px-3 ${
                      isTotal(ligne)
                        ? activeCote === 'actif' ? 'bg-blue-500/10' : 'bg-green-500/10'
                        : ''
                    }`}>
                      {!ligne.is_categorie && (
                        <span className={`text-xs font-mono font-semibold ${
                          isTotal(ligne)
                            ? activeCote === 'actif' ? 'text-blue-300' : 'text-green-300'
                            : getNET(ligne) < 0 ? 'text-red-400' : 'text-white'
                        }`}>
                          {isTotal(ligne)
                            ? isFinalTotal(ligne)
                              ? formatNum(getTotalNet(ligne.cote))
                              : formatNum(getTotalSection(ligne.cote, ligne.libelle))
                            : formatNum(getNET(ligne))
                          }
                        </span>
                      )}
                    </div>

                    {/* N-1 — Brut */}
                    <div className="col-span-1 border-l border-white/10 flex items-center">
                      {!ligne.is_categorie && (
                        isTotal(ligne) ? (
                          <span className="w-full px-2 py-2 text-xs text-right font-mono text-gray-500">
                            {isFinalTotal(ligne)
                              ? formatNum(getTotalBrutPrecedent(ligne.cote))
                              : formatNum(getBrutSectionPrecedent(ligne.cote, ligne.libelle))
                            }
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={ligne.brut_precedent || ''}
                            onChange={e => handleUpdateLigne(ligne.id, 'brut_precedent', e.target.value)}
                            className="w-full px-2 py-2 text-xs text-right font-mono bg-transparent border-0 outline-none focus:bg-white/5 text-gray-500 transition-colors"
                            placeholder="0"
                          />
                        )
                      )}
                    </div>

                    {/* N-1 — Amorts */}
                    <div className="col-span-1 border-l border-white/5 flex items-center">
                      {!ligne.is_categorie && (
                        isTotal(ligne) ? (
                          <span className="w-full px-2 py-2 text-xs text-right font-mono text-red-400/40">
                            {isFinalTotal(ligne)
                              ? formatNum(getTotalAmortsPrecedent(ligne.cote))
                              : formatNum(getAmortsSectionPrecedent(ligne.cote, ligne.libelle))
                            }
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={ligne.amorts_deprec_precedent || ''}
                            onChange={e => handleUpdateLigne(ligne.id, 'amorts_deprec_precedent', e.target.value)}
                            className="w-full px-2 py-2 text-xs text-right font-mono bg-transparent border-0 outline-none focus:bg-white/5 text-red-400/40 transition-colors"
                            placeholder="0"
                          />
                        )
                      )}
                    </div>

                    {/* N-1 — Net */}
                    <div className="col-span-2 border-l border-white/5 flex items-center justify-end px-3">
                      {!ligne.is_categorie && (
                        <span className="text-xs font-mono text-gray-500">
                          {isTotal(ligne)
                            ? isFinalTotal(ligne)
                              ? formatNum(getTotalNetPrecedent(ligne.cote))
                              : formatNum(getTotalSectionPrecedent(ligne.cote, ligne.libelle))
                            : formatNum(getNETPrecedent(ligne))
                          }
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Boutons bas */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveLignes}
                disabled={loading}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : '💾 Sauvegarder le bilan'}
              </button>
              {selectedBilan.statut !== 'publie' && (
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
                >
                  🚀 Publier le bilan
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}