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

type CR = {
  id: string
  societe_id: string
  annees: number[]
  devise: string
  statut: string
  created_at: string
  societes?: { nom: string; symbole: string | null } | null
}

type CRLigne = {
  id: string
  cr_id: string
  ref: string
  libelle: string
  valeurs: Record<string, number>
  ordre: number
  is_total: boolean
  is_categorie: boolean
  formule: string | null
}

const STRUCTURE_CR = [
  { ref: 'TA', libelle: 'Ventes de marchandises', is_categorie: false, is_total: false, formule: null },
  { ref: 'RA', libelle: 'Achats de marchandises', is_categorie: false, is_total: false, formule: null },
  { ref: 'RB', libelle: 'Variation de stocks', is_categorie: false, is_total: false, formule: null },
  { ref: 'XA', libelle: 'MARGE BRUTE SUR MARCHANDISES', is_categorie: false, is_total: true, formule: 'TA+RA+RB' },
  { ref: 'TB', libelle: 'Ventes de produits fabriqués', is_categorie: false, is_total: false, formule: null },
  { ref: 'TC', libelle: 'Travaux, services vendus', is_categorie: false, is_total: false, formule: null },
  { ref: 'TD', libelle: 'Produits accessoires', is_categorie: false, is_total: false, formule: null },
  { ref: 'XB', libelle: "CHIFFRE D'AFFAIRES (A+B+C+D)", is_categorie: false, is_total: true, formule: 'XA+TB+TC+TD' },
  { ref: 'TE', libelle: 'Production stockée (ou déstockage)', is_categorie: false, is_total: false, formule: null },
  { ref: 'TF', libelle: 'Production immobilisée', is_categorie: false, is_total: false, formule: null },
  { ref: 'TG', libelle: "Subventions d'exploitation", is_categorie: false, is_total: false, formule: null },
  { ref: 'TH', libelle: 'Autres produits', is_categorie: false, is_total: false, formule: null },
  { ref: 'TI', libelle: 'Transferts de charges', is_categorie: false, is_total: false, formule: null },
  { ref: 'RC', libelle: 'Achats de matières premières et fournitures liées', is_categorie: false, is_total: false, formule: null },
  { ref: 'RD', libelle: 'Variation de stocks de matières premières', is_categorie: false, is_total: false, formule: null },
  { ref: 'RE', libelle: 'Autres achats', is_categorie: false, is_total: false, formule: null },
  { ref: 'RF', libelle: "Variation de stocks d'autres approvisionnements", is_categorie: false, is_total: false, formule: null },
  { ref: 'RG', libelle: 'Transports', is_categorie: false, is_total: false, formule: null },
  { ref: 'RH', libelle: 'Services extérieurs', is_categorie: false, is_total: false, formule: null },
  { ref: 'RI', libelle: 'Impôts et taxes', is_categorie: false, is_total: false, formule: null },
  { ref: 'RJ', libelle: 'Autres charges', is_categorie: false, is_total: false, formule: null },
  { ref: 'XC', libelle: 'VALEUR AJOUTÉE', is_categorie: false, is_total: true, formule: 'XB+RA+RB+TE+TF+TG+TH+TI+RC+RD+RE+RF+RG+RH+RI+RJ' },
  { ref: 'RK', libelle: 'Charges de personnel', is_categorie: false, is_total: false, formule: null },
  { ref: 'XD', libelle: "EXCÉDENT BRUT D'EXPLOITATION", is_categorie: false, is_total: true, formule: 'XC+RK' },
  { ref: 'TJ', libelle: "Reprises d'amortissements", is_categorie: false, is_total: false, formule: null },
  { ref: 'RL', libelle: 'Dotations aux amortissements, aux provisions et dépréciations', is_categorie: false, is_total: false, formule: null },
  { ref: 'XE', libelle: "RÉSULTAT D'EXPLOITATION", is_categorie: false, is_total: true, formule: 'XD+TJ+RL' },
  { ref: 'TK', libelle: 'Revenus financiers et assimilés', is_categorie: false, is_total: false, formule: null },
  { ref: 'TL', libelle: 'Reprises de provisions et dépréciations financières', is_categorie: false, is_total: false, formule: null },
  { ref: 'TM', libelle: 'Transferts de charges financières', is_categorie: false, is_total: false, formule: null },
  { ref: 'RM', libelle: 'Frais financiers et charges assimilées', is_categorie: false, is_total: false, formule: null },
  { ref: 'RN', libelle: 'Dotations aux provisions et aux dépréciations financières', is_categorie: false, is_total: false, formule: null },
  { ref: 'XF', libelle: 'RÉSULTAT FINANCIER', is_categorie: false, is_total: true, formule: 'TK+TL+TM+RM+RN' },
  { ref: 'XG', libelle: "RÉSULTAT DES ACTIVITÉS ORDINAIRES", is_categorie: false, is_total: true, formule: 'XE+XF' },
  { ref: 'TN', libelle: "Produits des cessions d'immobilisations", is_categorie: false, is_total: false, formule: null },
  { ref: 'TO', libelle: 'Autres produits H.A.O.', is_categorie: false, is_total: false, formule: null },
  { ref: 'RO', libelle: "Valeurs comptables des cessions d'immobilisations", is_categorie: false, is_total: false, formule: null },
  { ref: 'RP', libelle: 'Charges H.A.O.', is_categorie: false, is_total: false, formule: null },
  { ref: 'XH', libelle: 'RÉSULTAT HORS ACTIVITÉS ORDINAIRES', is_categorie: false, is_total: true, formule: 'TN+TO+RO+RP' },
  { ref: 'RQ', libelle: 'Participations des travailleurs', is_categorie: false, is_total: false, formule: null },
  { ref: 'RS', libelle: 'Impôts sur le résultat', is_categorie: false, is_total: false, formule: null },
  { ref: 'XI', libelle: 'RÉSULTAT NET', is_categorie: false, is_total: true, formule: 'XG+XH+RQ+RS' },
]

export default function CRClient({
  societes: societesData,
  crs: crsData,
}: {
  societes: unknown[]
  crs: unknown[]
}) {
  const supabase = createClient()
  const [crs, setCrs] = useState<CR[]>(crsData as CR[])
  const societesList = societesData as Societe[]
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCR, setSelectedCR] = useState<CR | null>(null)
  const [lignes, setLignes] = useState<CRLigne[]>([])
  const [loadingLignes, setLoadingLignes] = useState(false)
  const [view, setView] = useState<'liste' | 'nouveau' | 'saisie'>('liste')

  const [crForm, setCrForm] = useState({
    societe_id: '',
    nb_annees: '1',
    annee_debut: new Date().getFullYear().toString(),
    devise: 'XOF',
  })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const getAnnees = (anneeDebut: number, nbAnnees: number): number[] =>
    Array.from({ length: nbAnnees }, (_, i) => anneeDebut + i)

  // Calcule une formule en utilisant les valeurs saisies ET les valeurs déjà calculées
  const calculerFormule = (
    formule: string,
    lignesMap: Record<string, CRLigne>,
    valeursCalcMap: Record<string, Record<string, number>>,
    annee: string
  ): number => {
    const refs = formule.split('+')
    return refs.reduce((sum, ref) => {
      const r = ref.trim()
      // Cherche d'abord dans les valeurs déjà calculées (cascades)
      if (valeursCalcMap[r]?.[annee] !== undefined) {
        return sum + valeursCalcMap[r][annee]
      }
      // Sinon dans les lignes saisies
      const ligne = lignesMap[r]
      if (!ligne) return sum
      return sum + (ligne.valeurs[annee] ?? 0)
    }, 0)
  }

  // Calcule tous les totaux dans l'ordre OHADA
  const getValeursCalculees = (
    lignes: CRLigne[],
    annees: number[]
  ): Record<string, Record<string, number>> => {
    const lignesMap: Record<string, CRLigne> = {}
    const result: Record<string, Record<string, number>> = {}

    lignes.forEach(l => { lignesMap[l.ref] = l })

    STRUCTURE_CR.forEach(item => {
      if (!item.formule) return
      const ligne = lignesMap[item.ref]
      if (!ligne) return

      result[item.ref] = {}
      annees.forEach(annee => {
        const val = calculerFormule(item.formule!, lignesMap, result, String(annee))
        result[item.ref][String(annee)] = val
      })
    })

    return result
  }

  const handleCreateCR = async () => {
    if (!crForm.societe_id || !crForm.annee_debut) {
      setError('Société et année requises')
      return
    }
    setLoading(true)
    setError(null)

    const nbAnnees = parseInt(crForm.nb_annees)
    const anneeDebut = parseInt(crForm.annee_debut)
    const annees = getAnnees(anneeDebut, nbAnnees)

    const { data: cr, error: crError } = await supabase
      .from('comptes_resultats')
      .insert({
        societe_id: crForm.societe_id,
        annees,
        devise: crForm.devise,
        statut: 'brouillon',
      })
      .select()
      .single()

    if (crError) {
      setError(crError.message)
      setLoading(false)
      return
    }

    const valeursVides: Record<string, number> = {}
    annees.forEach(a => { valeursVides[String(a)] = 0 })

    const lignesInsert = STRUCTURE_CR.map((item, i) => ({
      cr_id: cr.id,
      ref: item.ref,
      libelle: item.libelle,
      valeurs: item.formule ? {} : { ...valeursVides },
      ordre: i,
      is_total: item.is_total,
      is_categorie: item.is_categorie,
      formule: item.formule,
    }))

    await supabase.from('cr_lignes').insert(lignesInsert)

    const societe = societesList.find((s: Societe) => s.id === crForm.societe_id)
    const crAvecSociete: CR = {
      ...cr,
      societes: societe ? { nom: societe.nom, symbole: societe.symbole } : null
    }

    setCrs(prev => {
      const exists = prev.find(c => c.id === crAvecSociete.id)
      if (exists) return prev
      return [crAvecSociete, ...prev]
    })

    showSuccess('Compte de résultat créé !')
    setView('liste')
    setCrForm({
      societe_id: '',
      nb_annees: '1',
      annee_debut: new Date().getFullYear().toString(),
      devise: 'XOF',
    })
    setLoading(false)
  }

  const handleOpenCR = async (cr: CR) => {
    setSelectedCR(cr)
    setLoadingLignes(true)
    setView('saisie')

    const { data } = await supabase
      .from('cr_lignes')
      .select('*')
      .eq('cr_id', cr.id)
      .order('ordre')

    setLignes(data || [])
    setLoadingLignes(false)
  }

  const handleUpdateValeur = (id: string, annee: string, value: string) => {
    setLignes(prev => prev.map(l =>
      l.id === id
        ? { ...l, valeurs: { ...l.valeurs, [annee]: parseFloat(value) || 0 } }
        : l
    ))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    const updates = lignes
      .filter(l => !l.formule)
      .map(l => supabase.from('cr_lignes').update({ valeurs: l.valeurs }).eq('id', l.id))
    await Promise.all(updates)
    showSuccess('Sauvegardé !')
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!selectedCR) return
    await handleSave()
    await supabase.from('comptes_resultats').update({ statut: 'publie' }).eq('id', selectedCR.id)
    setCrs(prev => prev.map(c => c.id === selectedCR.id ? { ...c, statut: 'publie' } : c))
    setSelectedCR(prev => prev ? { ...prev, statut: 'publie' } : null)
    showSuccess('Compte de résultat publié !')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce compte de résultat ?')) return
    await supabase.from('comptes_resultats').delete().eq('id', id)
    setCrs(prev => prev.filter(c => c.id !== id))
    showSuccess('Supprimé !')
  }

  const formatNum = (n: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Math.round(n))

  const valeursCalculees = selectedCR
    ? getValeursCalculees(lignes, selectedCR.annees)
    : {}

  const getValeur = (ligne: CRLigne, annee: number): number => {
    const anneeStr = String(annee)
    if (ligne.formule && valeursCalculees[ligne.ref]) {
      return valeursCalculees[ligne.ref][anneeStr] ?? 0
    }
    return ligne.valeurs[anneeStr] ?? 0
  }

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
            <span className="text-gray-600 font-normal ml-2 text-sm">/ Comptes de résultats</span>
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
                <h2 className="text-2xl font-bold">📈 Comptes de résultats</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {crs.length} compte{crs.length > 1 ? 's' : ''} enregistré{crs.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setView('nouveau')}
                className="bg-[#C8A951] text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors"
              >
                + Nouveau CR
              </button>
            </div>

            {crs.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] rounded-2xl border border-white/5">
                <div className="text-5xl mb-4">📈</div>
                <p className="text-gray-500">Aucun compte de résultat enregistré</p>
                <button
                  onClick={() => setView('nouveau')}
                  className="mt-4 bg-[#C8A951] text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors"
                >
                  Créer le premier CR
                </button>
              </div>
            ) : (
              <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {crs.map(cr => (
                    <div key={cr.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#C8A951]/10 flex items-center justify-center text-[#C8A951] font-bold text-xs text-center leading-tight px-1">
                          {cr.annees?.[0]}
                          {cr.annees?.length > 1 && <><br />{'→' + cr.annees[cr.annees.length - 1]}</>}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {cr.societes?.nom || '—'}
                            {cr.societes?.symbole && (
                              <span className="ml-2 text-xs text-[#C8A951]">({cr.societes.symbole})</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {cr.annees?.join(', ')} · {cr.devise} · {cr.annees?.length} an{cr.annees?.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          cr.statut === 'publie'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {cr.statut === 'publie' ? '✓ Publié' : '✏️ Brouillon'}
                        </span>
                        <button
                          onClick={() => handleOpenCR(cr)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#C8A951]/10 text-[#C8A951] hover:bg-[#C8A951]/20 transition-colors"
                        >
                          Saisir les montants
                        </button>
                        <button
                          onClick={() => handleDelete(cr.id)}
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

        {/* ── NOUVEAU CR ── */}
        {view === 'nouveau' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setView('liste')} className="text-gray-500 hover:text-white text-sm">
                ← Retour
              </button>
              <h2 className="text-xl font-bold">Nouveau compte de résultat</h2>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Société *</label>
                <select
                  value={crForm.societe_id}
                  onChange={e => setCrForm(p => ({ ...p, societe_id: e.target.value }))}
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
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">{"Nombre d'années"}</label>
                  <div className="flex gap-2">
                    {['1', '2', '3', '4'].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCrForm(p => ({ ...p, nb_annees: n }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                          crForm.nb_annees === n
                            ? 'bg-[#C8A951] text-black'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Première année *</label>
                  <input
                    type="number"
                    placeholder="Ex: 2021"
                    value={crForm.annee_debut}
                    onChange={e => setCrForm(p => ({ ...p, annee_debut: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm"
                  />
                </div>
              </div>

              {/* Aperçu années */}
              {crForm.annee_debut && (
                <div className="bg-[#C8A951]/5 border border-[#C8A951]/20 rounded-xl p-3">
                  <p className="text-xs text-[#C8A951] font-medium mb-2">📅 Années couvertes</p>
                  <div className="flex gap-2 flex-wrap">
                    {getAnnees(parseInt(crForm.annee_debut), parseInt(crForm.nb_annees)).map(a => (
                      <span key={a} className="text-xs bg-[#C8A951]/20 text-[#C8A951] px-3 py-1 rounded-full font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Devise</label>
                <select
                  value={crForm.devise}
                  onChange={e => setCrForm(p => ({ ...p, devise: e.target.value }))}
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

              <button
                onClick={handleCreateCR}
                disabled={loading}
                className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer le compte de résultat'}
              </button>
            </div>
          </div>
        )}

        {/* ── SAISIE ── */}
        {view === 'saisie' && selectedCR && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedCR.societes?.nom || '—'}
                  {selectedCR.societes?.symbole && (
                    <span className="ml-2 text-sm text-[#C8A951]">({selectedCR.societes.symbole})</span>
                  )}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {selectedCR.annees?.join(' · ')} · {selectedCR.devise}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                {selectedCR.statut !== 'publie' && (
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

            {/* Résultats nets en haut */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${Math.min(selectedCR.annees?.length, 4)}, 1fr)` }}>
              {selectedCR.annees?.map(annee => {
                const ligneXI = lignes.find(l => l.ref === 'XI')
                const valXI = ligneXI ? getValeur(ligneXI, annee) : 0
                return (
                  <div key={annee} className={`rounded-xl p-4 border ${
                    valXI > 0
                      ? 'bg-green-500/10 border-green-500/20'
                      : valXI < 0
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <p className={`text-xs mb-1 ${valXI > 0 ? 'text-green-400' : valXI < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      RÉSULTAT NET {annee}
                    </p>
                    <p className="text-lg font-bold text-white">
                      {formatNum(valXI)}
                      <span className="text-xs text-gray-500 ml-1">{selectedCR.devise}</span>
                    </p>
                  </div>
                )
              })}
            </div>

            {loadingLignes ? (
              <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
              <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">

                {/* En-tête tableau */}
                <div
                  className="grid border-b border-white/10 bg-[#1a1a1a]"
                  style={{ gridTemplateColumns: `80px 1fr repeat(${selectedCR.annees?.length}, minmax(120px, 1fr))` }}
                >
                  <div className="px-3 py-3 text-xs text-gray-400 uppercase tracking-wider font-medium">
                    Réf.
                  </div>
                  <div className="px-3 py-3 text-xs text-gray-400 uppercase tracking-wider font-medium border-l border-white/5">
                    Libellé
                  </div>
                  {selectedCR.annees?.map(annee => (
                    <div key={annee} className="px-3 py-3 text-xs text-[#C8A951] font-medium text-right border-l border-white/5">
                      {annee}
                    </div>
                  ))}
                </div>

                {/* Lignes */}
                {lignes.map(ligne => {
                  const isTotalLigne = ligne.is_total
                  const isXI = ligne.ref === 'XI'

                  return (
                    <div
                      key={ligne.id}
                      className={`grid border-b border-white/5 ${
                        isXI
                          ? 'bg-[#C8A951]/10'
                          : isTotalLigne
                          ? 'bg-[#C8A951]/5'
                          : 'hover:bg-white/2'
                      }`}
                      style={{ gridTemplateColumns: `80px 1fr repeat(${selectedCR.annees?.length}, minmax(120px, 1fr))` }}
                    >
                      {/* Ref */}
                      <div className="px-3 py-2 flex items-center">
                        <span className={`text-xs font-mono font-semibold ${
                          isTotalLigne ? 'text-[#C8A951]' : 'text-gray-500'
                        }`}>
                          {ligne.ref}
                        </span>
                      </div>

                      {/* Libellé */}
                      <div className="px-3 py-2 flex items-center border-l border-white/5">
                        <span className={`text-xs ${
                          isTotalLigne
                            ? 'text-[#C8A951] font-semibold uppercase tracking-wide'
                            : 'text-gray-300 pl-2'
                        }`}>
                          {ligne.libelle}
                        </span>
                      </div>

                      {/* Valeurs par année */}
                      {selectedCR.annees?.map(annee => {
                        const val = getValeur(ligne, annee)
                        const isNeg = val < 0
                        const isPos = val > 0

                        return (
                          <div key={annee} className={`border-l border-white/5 flex items-center ${
                            isTotalLigne ? 'bg-[#C8A951]/5' : ''
                          }`}>
                            {isTotalLigne || ligne.formule ? (
                              <span className={`w-full px-3 py-2 text-xs text-right font-mono font-semibold ${
                                isXI
                                  ? isPos ? 'text-green-400' : isNeg ? 'text-red-400' : 'text-gray-400'
                                  : isTotalLigne
                                  ? 'text-[#C8A951]'
                                  : isNeg ? 'text-red-400' : 'text-white'
                              }`}>
                                {formatNum(val)}
                              </span>
                            ) : (
                              <input
                                type="number"
                                value={ligne.valeurs[String(annee)] === 0 ? '' : ligne.valeurs[String(annee)] || ''}
                                onChange={e => handleUpdateValeur(ligne.id, String(annee), e.target.value)}
                                className="w-full px-3 py-2 text-xs text-right font-mono bg-transparent border-0 outline-none focus:bg-white/5 text-gray-300 transition-colors"
                                placeholder="0"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Boutons bas */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : '💾 Sauvegarder le CR'}
              </button>
              {selectedCR.statut !== 'publie' && (
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
                >
                  🚀 Publier le CR
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}