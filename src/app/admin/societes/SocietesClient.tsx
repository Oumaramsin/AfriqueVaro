'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Societe = {
  id: string
  nom: string
  symbole: string | null
  description: string | null
  is_active: boolean
  secteur_id: string | null
  bourse_id: string | null
  zone_id: string | null
  secteurs?: { nom: string } | null
  bourses?: { nom: string; code: string } | null
  zones?: { nom: string } | null
}

type Secteur = { id: string; nom: string }
type Bourse = { id: string; nom: string; code: string }
type Zone = { id: string; nom: string }

type Tab = 'societes' | 'secteurs' | 'bourses' | 'zones'

export default function SocietesClient({
  societes: initialSocietes,
  secteurs: initialSecteurs,
  bourses: initialBourses,
  zones: initialZones,
}: {
  societes: Societe[]
  secteurs: Secteur[]
  bourses: Bourse[]
  zones: Zone[]
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('societes')
  const [societes, setSocietes] = useState(initialSocietes)
  const [secteurs, setSecteurs] = useState(initialSecteurs)
  const [bourses, setBourses] = useState(initialBourses)
  const [zones, setZones] = useState(initialZones)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  // Forms
  const [societeForm, setSocieteForm] = useState({
    nom: '', symbole: '', description: '',
    secteur_id: '', bourse_id: '', zone_id: ''
  })
  const [secteurForm, setSecteurForm] = useState({ nom: '', description: '' })
  const [bourseForm, setBourseForm] = useState({ nom: '', code: '', devise: '', description: '' })
  const [zoneForm, setZoneForm] = useState({ nom: '', description: '' })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  // ── SOCIÉTÉS ──────────────────────────────────────

  const handleAddSociete = async () => {
    if (!societeForm.nom) { setError('Le nom est requis'); return }
    setLoading(true); setError(null)

    const { data, error } = await supabase.from('societes').insert({
      nom: societeForm.nom,
      symbole: societeForm.symbole || null,
      description: societeForm.description || null,
      secteur_id: societeForm.secteur_id || null,
      bourse_id: societeForm.bourse_id || null,
      zone_id: societeForm.zone_id || null,
    }).select('*, secteurs(nom), bourses(nom, code), zones(nom)').single()

    if (error) { setError(error.message); setLoading(false); return }
    setSocietes(prev => [...prev, data])
    setSocieteForm({ nom: '', symbole: '', description: '', secteur_id: '', bourse_id: '', zone_id: '' })
    showSuccess('Société ajoutée !')
    setLoading(false)
  }

  const handleUpdateSociete = async (id: string) => {
    setLoading(true); setError(null)

    const { data, error } = await supabase.from('societes').update({
      nom: societeForm.nom,
      symbole: societeForm.symbole || null,
      description: societeForm.description || null,
      secteur_id: societeForm.secteur_id || null,
      bourse_id: societeForm.bourse_id || null,
      zone_id: societeForm.zone_id || null,
    }).eq('id', id)
    .select('*, secteurs(nom), bourses(nom, code), zones(nom)').single()

    if (error) { setError(error.message); setLoading(false); return }
    setSocietes(prev => prev.map(s => s.id === id ? data : s))
    setEditId(null)
    setSocieteForm({ nom: '', symbole: '', description: '', secteur_id: '', bourse_id: '', zone_id: '' })
    showSuccess('Société mise à jour !')
    setLoading(false)
  }

  const handleDeleteSociete = async (id: string) => {
    if (!confirm('Supprimer cette société ?')) return
    await supabase.from('societes').delete().eq('id', id)
    setSocietes(prev => prev.filter(s => s.id !== id))
    showSuccess('Société supprimée !')
  }

  const handleToggleSociete = async (id: string, current: boolean) => {
    await supabase.from('societes').update({ is_active: !current }).eq('id', id)
    setSocietes(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const startEdit = (societe: Societe) => {
    setEditId(societe.id)
    setSocieteForm({
      nom: societe.nom,
      symbole: societe.symbole || '',
      description: societe.description || '',
      secteur_id: societe.secteur_id || '',
      bourse_id: societe.bourse_id || '',
      zone_id: societe.zone_id || '',
    })
  }

  // ── SECTEURS ──────────────────────────────────────

  const handleAddSecteur = async () => {
    if (!secteurForm.nom) { setError('Le nom est requis'); return }
    setLoading(true); setError(null)

    const { data, error } = await supabase.from('secteurs')
      .insert({ nom: secteurForm.nom, description: secteurForm.description || null })
      .select().single()

    if (error) { setError(error.message); setLoading(false); return }
    setSecteurs(prev => [...prev, data])
    setSecteurForm({ nom: '', description: '' })
    showSuccess('Secteur ajouté !')
    setLoading(false)
  }

  const handleDeleteSecteur = async (id: string) => {
    if (!confirm('Supprimer ce secteur ?')) return
    await supabase.from('secteurs').delete().eq('id', id)
    setSecteurs(prev => prev.filter(s => s.id !== id))
    showSuccess('Secteur supprimé !')
  }

  // ── BOURSES ───────────────────────────────────────

  const handleAddBourse = async () => {
    if (!bourseForm.nom || !bourseForm.code) { setError('Nom et code requis'); return }
    setLoading(true); setError(null)

    const { data, error } = await supabase.from('bourses')
      .insert({
        nom: bourseForm.nom,
        code: bourseForm.code.toUpperCase(),
        devise: bourseForm.devise || null,
        description: bourseForm.description || null,
      }).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    setBourses(prev => [...prev, data])
    setBourseForm({ nom: '', code: '', devise: '', description: '' })
    showSuccess('Bourse ajoutée !')
    setLoading(false)
  }

  const handleDeleteBourse = async (id: string) => {
    if (!confirm('Supprimer cette bourse ?')) return
    await supabase.from('bourses').delete().eq('id', id)
    setBourses(prev => prev.filter(b => b.id !== id))
    showSuccess('Bourse supprimée !')
  }

  // ── ZONES ─────────────────────────────────────────

  const handleAddZone = async () => {
    if (!zoneForm.nom) { setError('Le nom est requis'); return }
    setLoading(true); setError(null)

    const { data, error } = await supabase.from('zones')
      .insert({ nom: zoneForm.nom, description: zoneForm.description || null })
      .select().single()

    if (error) { setError(error.message); setLoading(false); return }
    setZones(prev => [...prev, data])
    setZoneForm({ nom: '', description: '' })
    showSuccess('Zone ajoutée !')
    setLoading(false)
  }

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Supprimer cette zone ?')) return
    await supabase.from('zones').delete().eq('id', id)
    setZones(prev => prev.filter(z => z.id !== id))
    showSuccess('Zone supprimée !')
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm"
  const selectClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#C8A951] text-sm"
  const labelClass = "block text-xs text-gray-500 mb-1 uppercase tracking-wider"

  const TABS = [
    { id: 'societes', label: '🏢 Sociétés', count: societes.length },
    { id: 'secteurs', label: '🏭 Secteurs', count: secteurs.length },
    { id: 'bourses', label: '📈 Bourses', count: bourses.length },
    { id: 'zones', label: '🌍 Zones', count: zones.length },
  ]

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
            <span className="text-gray-600 font-normal ml-2 text-sm">/ Sociétés</span>
          </h1>
        </div>
        <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-medium">
          🔐 Zone Admin
        </span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Messages */}
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

        {/* Onglets */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as Tab); setError(null); setEditId(null) }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                tab === t.id
                  ? 'bg-[#C8A951]/10 border-[#C8A951]/30'
                  : 'bg-[#141414] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="text-sm font-medium text-white">{t.label}</div>
              <div className="text-2xl font-bold text-[#C8A951] mt-1">{t.count}</div>
            </button>
          ))}
        </div>

        {/* ── SOCIÉTÉS ── */}
        {tab === 'societes' && (
          <div className="space-y-6">

            {/* Formulaire ajout/édition */}
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">
                {editId ? '✏️ Modifier la société' : '+ Ajouter une société'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom de la société *</label>
                  <input
                    type="text"
                    placeholder="Ex: Sonatel, MTN, Total..."
                    value={societeForm.nom}
                    onChange={e => setSocieteForm(p => ({ ...p, nom: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Symbole boursier</label>
                  <input
                    type="text"
                    placeholder="Ex: SNTS, MTN..."
                    value={societeForm.symbole}
                    onChange={e => setSocieteForm(p => ({ ...p, symbole: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Secteur</label>
                  <select
                    value={societeForm.secteur_id}
                    onChange={e => setSocieteForm(p => ({ ...p, secteur_id: e.target.value }))}
                    className={selectClass}
                  >
                    <option value="">Sélectionner un secteur</option>
                    {secteurs.map(s => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Bourse</label>
                  <select
                    value={societeForm.bourse_id}
                    onChange={e => setSocieteForm(p => ({ ...p, bourse_id: e.target.value }))}
                    className={selectClass}
                  >
                    <option value="">Sélectionner une bourse</option>
                    {bourses.map(b => (
                      <option key={b.id} value={b.id}>{b.nom} ({b.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Zone</label>
                  <select
                    value={societeForm.zone_id}
                    onChange={e => setSocieteForm(p => ({ ...p, zone_id: e.target.value }))}
                    className={selectClass}
                  >
                    <option value="">Sélectionner une zone</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    placeholder="Description courte..."
                    value={societeForm.description}
                    onChange={e => setSocieteForm(p => ({ ...p, description: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => editId ? handleUpdateSociete(editId) : handleAddSociete()}
                  disabled={loading}
                  className="flex-1 bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : editId ? 'Mettre à jour' : '+ Ajouter'}
                </button>
                {editId && (
                  <button
                    onClick={() => { setEditId(null); setSocieteForm({ nom: '', symbole: '', description: '', secteur_id: '', bourse_id: '', zone_id: '' }) }}
                    className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {/* Liste sociétés */}
            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  {societes.length} société{societes.length > 1 ? 's' : ''}
                </h3>
              </div>
              {societes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">🏢</div>
                  <p>Aucune société ajoutée</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {societes.map(societe => (
                    <div key={societe.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-white">{societe.nom}</p>
                          {societe.symbole && (
                            <span className="text-xs bg-[#C8A951]/20 text-[#C8A951] px-2 py-0.5 rounded-full">
                              {societe.symbole}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            societe.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {societe.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          {societe.secteurs && (
                            <span className="text-xs text-gray-500">🏭 {societe.secteurs.nom}</span>
                          )}
                          {societe.bourses && (
                            <span className="text-xs text-gray-500">📈 {societe.bourses.code}</span>
                          )}
                          {societe.zones && (
                            <span className="text-xs text-gray-500">🌍 {societe.zones.nom}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSociete(societe.id, societe.is_active)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          {societe.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => startEdit(societe)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#C8A951]/10 text-[#C8A951] hover:bg-[#C8A951]/20 transition-colors"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteSociete(societe.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTEURS ── */}
        {tab === 'secteurs' && (
          <div className="space-y-6">
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">+ Ajouter un secteur</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom du secteur *</label>
                  <input
                    type="text"
                    placeholder="Ex: Finance & Banque..."
                    value={secteurForm.nom}
                    onChange={e => setSecteurForm(p => ({ ...p, nom: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    placeholder="Description courte..."
                    value={secteurForm.description}
                    onChange={e => setSecteurForm(p => ({ ...p, description: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={handleAddSecteur}
                disabled={loading}
                className="w-full mt-4 bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
              >
                {loading ? 'Ajout...' : '+ Ajouter le secteur'}
              </button>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white">{secteurs.length} secteur{secteurs.length > 1 ? 's' : ''}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {secteurs.map(secteur => (
                  <div key={secteur.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                    <p className="text-white font-medium">🏭 {secteur.nom}</p>
                    <button
                      onClick={() => handleDeleteSecteur(secteur.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BOURSES ── */}
        {tab === 'bourses' && (
          <div className="space-y-6">
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">+ Ajouter une bourse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom de la bourse *</label>
                  <input
                    type="text"
                    placeholder="Ex: BRVM, NSE..."
                    value={bourseForm.nom}
                    onChange={e => setBourseForm(p => ({ ...p, nom: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Code *</label>
                  <input
                    type="text"
                    placeholder="Ex: BRVM, NSE, JSE..."
                    value={bourseForm.code}
                    onChange={e => setBourseForm(p => ({ ...p, code: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Devise</label>
                  <input
                    type="text"
                    placeholder="Ex: XOF, NGN, ZAR..."
                    value={bourseForm.devise}
                    onChange={e => setBourseForm(p => ({ ...p, devise: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    placeholder="Description courte..."
                    value={bourseForm.description}
                    onChange={e => setBourseForm(p => ({ ...p, description: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={handleAddBourse}
                disabled={loading}
                className="w-full mt-4 bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
              >
                {loading ? 'Ajout...' : '+ Ajouter la bourse'}
              </button>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white">{bourses.length} bourse{bourses.length > 1 ? 's' : ''}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {bourses.map(bourse => (
                  <div key={bourse.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                    <div>
                      <p className="text-white font-medium">📈 {bourse.nom}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{bourse.code}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBourse(bourse.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ZONES ── */}
        {tab === 'zones' && (
          <div className="space-y-6">
            <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-4">+ Ajouter une zone</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom de la zone *</label>
                  <input
                    type="text"
                    placeholder="Ex: Afrique de l'Ouest..."
                    value={zoneForm.nom}
                    onChange={e => setZoneForm(p => ({ ...p, nom: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    placeholder="Description courte..."
                    value={zoneForm.description}
                    onChange={e => setZoneForm(p => ({ ...p, description: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                onClick={handleAddZone}
                disabled={loading}
                className="w-full mt-4 bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50"
              >
                {loading ? 'Ajout...' : '+ Ajouter la zone'}
              </button>
            </div>

            <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white">{zones.length} zone{zones.length > 1 ? 's' : ''}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {zones.map(zone => (
                  <div key={zone.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                    <p className="text-white font-medium">🌍 {zone.nom}</p>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}