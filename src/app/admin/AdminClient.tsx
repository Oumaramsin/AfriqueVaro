'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'


type Notification = {
  id: string
  type: string
  titre: string
  message: string
  is_read: boolean
  created_at: string
}

type Pays = { id: string; nom: string; code: string; drapeau: string }
type Bourse = { id: string; nom: string; code: string }

type Tab = 'cours' | 'actualites' | 'macro' | 'taux'

export default function AdminClient({
  pays, bourses
}: {
  pays: Pays[]
  bourses: Bourse[]
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('cours')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [syncingAlpha, setSyncingAlpha] = useState(false)
  const [syncAlphaResult, setSyncAlphaResult] = useState<string | null>(null)

  useEffect(() => {
    async function loadNotifs() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      setNotifications(data || [])
    }
    loadNotifs()
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }
  const syncWorldBank = async () => {
  setSyncing(true)
  setSyncResult(null)
  try {
    const res = await fetch('/api/sync-worldbank', { method: 'POST' })
    const data = await res.json()
    setSyncResult(`✓ ${data.inserted} données importées depuis la Banque Mondiale`)
  } catch (_e) {
    setSyncResult('Erreur lors de la synchronisation')
  } finally {
    setSyncing(false)
  }
}
  // Formulaires
  const [cours, setCours] = useState({
    bourse_id: '', symbole: '', nom_entreprise: '',
    cours: '', variation: '', volume: '', date_cours: new Date().toISOString().split('T')[0]
  })

  const [actualite, setActualite] = useState({
    titre: '', contenu: '', resume: '', pays_id: '',
    categorie: 'marches', auteur: '', source: '',
    is_premium: false, is_published: true,
    published_at: new Date().toISOString()
  })

  const [macro, setMacro] = useState({
    pays_id: '', indicateur: '', valeur: '',
    unite: '', annee: new Date().getFullYear().toString(), source: ''
  })

  const [taux, setTaux] = useState({
    devise_base: '', devise_cible: 'EUR',
    taux: '', date_taux: new Date().toISOString().split('T')[0], source: ''
  })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  // Soumettre cours
  const submitCours = async () => {
    if (!cours.bourse_id || !cours.symbole || !cours.nom_entreprise || !cours.cours) {
      setError('Remplis tous les champs obligatoires'); return
    }
    setLoading(true); setError(null)
    const { error } = await supabase.from('cours_actions').insert({
      bourse_id: cours.bourse_id,
      symbole: cours.symbole.toUpperCase(),
      nom_entreprise: cours.nom_entreprise,
      cours: parseFloat(cours.cours),
      variation: parseFloat(cours.variation || '0'),
      volume: parseInt(cours.volume || '0'),
      date_cours: cours.date_cours,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setCours({ bourse_id: cours.bourse_id, symbole: '', nom_entreprise: '', cours: '', variation: '', volume: '', date_cours: cours.date_cours })
    showSuccess('Cours ajouté avec succès !')
    setLoading(false)
  }

  // Soumettre actualité
  const submitActualite = async () => {
    if (!actualite.titre || !actualite.contenu) {
      setError('Titre et contenu requis'); return
    }
    setLoading(true); setError(null)
    const { error } = await supabase.from('actualites').insert({
      titre: actualite.titre,
      contenu: actualite.contenu,
      resume: actualite.resume,
      pays_id: actualite.pays_id || null,
      categorie: actualite.categorie,
      auteur: actualite.auteur,
      source: actualite.source,
      is_premium: actualite.is_premium,
      is_published: actualite.is_published,
      published_at: actualite.is_published ? new Date().toISOString() : null,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setActualite({ titre: '', contenu: '', resume: '', pays_id: '', categorie: 'marches', auteur: '', source: '', is_premium: false, is_published: true, published_at: new Date().toISOString() })
    showSuccess('Actualité publiée !')
    setLoading(false)
  }

  // Soumettre macro
  const submitMacro = async () => {
    if (!macro.pays_id || !macro.indicateur || !macro.valeur) {
      setError('Pays, indicateur et valeur requis'); return
    }
    setLoading(true); setError(null)
    const { error } = await supabase.from('donnees_macro').insert({
      pays_id: macro.pays_id,
      indicateur: macro.indicateur,
      valeur: parseFloat(macro.valeur),
      unite: macro.unite,
      annee: parseInt(macro.annee),
      source: macro.source,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setMacro({ ...macro, indicateur: '', valeur: '', unite: '', source: '' })
    showSuccess('Donnée macro ajoutée !')
    setLoading(false)
  }

  // Soumettre taux
  const submitTaux = async () => {
    if (!taux.devise_base || !taux.taux) {
      setError('Devise et taux requis'); return
    }
    setLoading(true); setError(null)
    const { error } = await supabase.from('taux_change').insert({
      devise_base: taux.devise_base.toUpperCase(),
      devise_cible: taux.devise_cible.toUpperCase(),
      taux: parseFloat(taux.taux),
      date_taux: taux.date_taux,
      source: taux.source,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setTaux({ ...taux, devise_base: '', taux: '', source: '' })
    showSuccess('Taux de change ajouté !')
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm"
  const selectClass = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#C8A951] text-sm"
  const labelClass = "block text-xs text-gray-500 mb-1 uppercase tracking-wider"

  const TABS = [
    { id: 'cours', label: '📈 Cours', desc: 'Actions & indices' },
    { id: 'actualites', label: '📰 Actualités', desc: 'Articles & news' },
    { id: 'macro', label: '📊 Macro', desc: 'Données pays' },
    { id: 'taux', label: '💱 Taux', desc: 'Devises' },
  ]

  /*API AlphaAvantage*/
  const syncAlphaVantage = async () => {
  setSyncingAlpha(true)
  setSyncAlphaResult(null)
  try {
    const res = await fetch('/api/sync-alphavantage', { method: 'POST' })
    const data = await res.json()
    setSyncAlphaResult(`✓ ${data.inserted} cours importés depuis Alpha Vantage`)
  } catch (_e) {
    setSyncAlphaResult('Erreur lors de la synchronisation Alpha Vantage')
  } finally {
    setSyncingAlpha(false)
  }
}

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* NAV */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold">
            Afrique<span className="text-[#C8A951]">Varo</span>
            <span className="text-gray-600 font-normal ml-2 text-sm">/ Admin</span>
          </h1>
        </div>
        <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-medium">
          🔐 Zone Admin
        </span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Saisie des données</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Ajoute et gère les données de la plateforme
          </p>
        </div>

        {/* Dans la nav admin, à côté du bouton "Zone Admin" */}
        <div className="relative">
        <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
            🔔
            {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {unreadCount}
            </span>
            )}
        </button>

        {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-xs text-gray-500">{unreadCount} non lues</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                    Aucune notification
                </div>
                ) : (
                notifications.map(n => (
                    <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                        !n.is_read ? 'bg-[#C8A951]/5' : ''
                    }`}
                    >
                    <div className="flex items-start gap-2">
                        <span className="text-sm">
                        {n.type === 'nouvel_utilisateur' ? '👤' :
                        n.type === 'nouvelle_actualite' ? '📰' : '🔔'}
                        </span>
                        <div className="flex-1">
                        <p className="text-xs font-medium text-white">{n.titre}</p>
                        {n.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                            {new Date(n.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        </div>
                        {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#C8A951] mt-1 flex-shrink-0" />
                        )}
                    </div>
                    </div>
                ))
                )}
            </div>
            </div>
        )}
        </div>

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

        {/* Tabs */}

        {/* Bouton sync World Bank */}
       <div className="bg-[#141414] rounded-2xl border border-white/5 p-4 mb-6 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-white">🌍 Données Banque Mondiale</p>
            <p className="text-xs text-gray-500 mt-0.5">
            Importe automatiquement PIB, inflation, chômage... pour tous les pays
            </p>
        </div>
        <button
            onClick={syncWorldBank}
            disabled={syncing}
            className="bg-[#C8A951] text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E2C97E] transition-colors disabled:opacity-50 whitespace-nowrap ml-4"
        >
            {syncing ? '⏳ Sync...' : '🔄 Synchroniser'}
        </button>
        </div>

        {syncResult && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 mb-4 text-sm">
            {syncResult}
        </div>
        )}

        {/* Bouton sync Alpha Vantage */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-4 mb-6 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-white">📈 Cours Alpha Vantage</p>
            <p className="text-xs text-gray-500 mt-0.5">
            Importe les cours des grandes valeurs africaines (JSE, NSE...)
            </p>
            <p className="text-xs text-yellow-500 mt-1">
            ⚠️ Opération longue (~2 min) — limite 5 requêtes/min
            </p>
        </div>
        <button
            onClick={syncAlphaVantage}
            disabled={syncingAlpha}
            className="bg-[#C8A951] text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E2C97E] transition-colors disabled:opacity-50 whitespace-nowrap ml-4"
        >
            {syncingAlpha ? '⏳ Sync en cours...' : '🔄 Synchroniser'}
        </button>
        </div>

        {syncAlphaResult && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 mb-4 text-sm">
            {syncAlphaResult}
        </div>
        )}
        


        <div className="grid grid-cols-4 gap-3 mb-8">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as Tab); setError(null) }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                tab === t.id
                  ? 'bg-[#C8A951]/10 border-[#C8A951]/30 text-white'
                  : 'bg-[#141414] border-white/5 text-gray-500 hover:border-white/10'
              }`}>
              <div className="text-lg mb-1">{t.label.split(' ')[0]}</div>
              <div className="text-xs font-medium">{t.label.split(' ').slice(1).join(' ')}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ── COURS ── */}
        {tab === 'cours' && (
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-white mb-2">Ajouter un cours</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bourse *</label>
                <select value={cours.bourse_id} onChange={e => setCours(p => ({ ...p, bourse_id: e.target.value }))} className={selectClass}>
                  <option value="">Sélectionner</option>
                  {bourses.map(b => <option key={b.id} value={b.id}>{b.nom} ({b.code})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Symbole *</label>
                <input type="text" placeholder="Ex: SNTS" value={cours.symbole}
                  onChange={e => setCours(p => ({ ...p, symbole: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Nom de l&apos;entreprise *</label>
              <input type="text" placeholder="Ex: Sonatel" value={cours.nom_entreprise}
                onChange={e => setCours(p => ({ ...p, nom_entreprise: e.target.value }))}
                className={inputClass} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Cours *</label>
                <input type="number" step="0.01" placeholder="Ex: 15400" value={cours.cours}
                  onChange={e => setCours(p => ({ ...p, cours: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Variation (%)</label>
                <input type="number" step="0.01" placeholder="Ex: +1.25" value={cours.variation}
                  onChange={e => setCours(p => ({ ...p, variation: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Volume</label>
                <input type="number" placeholder="Ex: 12500" value={cours.volume}
                  onChange={e => setCours(p => ({ ...p, volume: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" value={cours.date_cours}
                onChange={e => setCours(p => ({ ...p, date_cours: e.target.value }))}
                className={inputClass} />
            </div>

            <button onClick={submitCours} disabled={loading}
              className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50">
              {loading ? 'Ajout...' : '+ Ajouter le cours'}
            </button>
          </div>
        )}

        {/* ── ACTUALITÉS ── */}
        {tab === 'actualites' && (
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-white mb-2">Publier une actualité</h3>

            <div>
              <label className={labelClass}>Titre *</label>
              <input type="text" placeholder="Titre de l'article"
                value={actualite.titre}
                onChange={e => setActualite(p => ({ ...p, titre: e.target.value }))}
                className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Résumé</label>
              <input type="text" placeholder="Résumé court (affiché dans la liste)"
                value={actualite.resume}
                onChange={e => setActualite(p => ({ ...p, resume: e.target.value }))}
                className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Contenu *</label>
              <textarea rows={6} placeholder="Contenu complet de l'article..."
                value={actualite.contenu}
                onChange={e => setActualite(p => ({ ...p, contenu: e.target.value }))}
                className={inputClass + ' resize-none'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Catégorie</label>
                <select value={actualite.categorie}
                  onChange={e => setActualite(p => ({ ...p, categorie: e.target.value }))}
                  className={selectClass}>
                  <option value="marches">Marchés</option>
                  <option value="macro">Macro-économie</option>
                  <option value="entreprises">Entreprises</option>
                  <option value="politique">Politique économique</option>
                  <option value="energie">Énergie</option>
                  <option value="agriculture">Agriculture</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Pays concerné</label>
                <select value={actualite.pays_id}
                  onChange={e => setActualite(p => ({ ...p, pays_id: e.target.value }))}
                  className={selectClass}>
                  <option value="">Tous les pays</option>
                  {pays.map(p => <option key={p.id} value={p.id}>{p.drapeau} {p.nom}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Auteur</label>
                <input type="text" placeholder="Nom de l'auteur"
                  value={actualite.auteur}
                  onChange={e => setActualite(p => ({ ...p, auteur: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Source</label>
                <input type="text" placeholder="Ex: Reuters, AFP..."
                  value={actualite.source}
                  onChange={e => setActualite(p => ({ ...p, source: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={actualite.is_published}
                  onChange={e => setActualite(p => ({ ...p, is_published: e.target.checked }))}
                  className="accent-[#C8A951] w-4 h-4" />
                <span className="text-sm text-gray-300">Publier immédiatement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={actualite.is_premium}
                  onChange={e => setActualite(p => ({ ...p, is_premium: e.target.checked }))}
                  className="accent-[#C8A951] w-4 h-4" />
                <span className="text-sm text-gray-300">Contenu Premium</span>
              </label>
            </div>

            <button onClick={submitActualite} disabled={loading}
              className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50">
              {loading ? 'Publication...' : '+ Publier l\'actualité'}
            </button>
          </div>
        )}

        {/* ── MACRO ── */}
        {tab === 'macro' && (
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-white mb-2">Ajouter une donnée macro</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Pays *</label>
                <select value={macro.pays_id}
                  onChange={e => setMacro(p => ({ ...p, pays_id: e.target.value }))}
                  className={selectClass}>
                  <option value="">Sélectionner</option>
                  {pays.map(p => <option key={p.id} value={p.id}>{p.drapeau} {p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Indicateur *</label>
                <select value={macro.indicateur}
                  onChange={e => setMacro(p => ({ ...p, indicateur: e.target.value }))}
                  className={selectClass}>
                  <option value="">Sélectionner</option>
                  <option value="PIB">PIB</option>
                  <option value="Croissance PIB">Croissance PIB</option>
                  <option value="Inflation">Inflation</option>
                  <option value="Chomage">Chômage</option>
                  <option value="Dette publique">Dette publique</option>
                  <option value="Balance commerciale">Balance commerciale</option>
                  <option value="IDE">IDE entrants</option>
                  <option value="Population">Population</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Valeur *</label>
                <input type="number" step="0.01" placeholder="Ex: 27.5"
                  value={macro.valeur}
                  onChange={e => setMacro(p => ({ ...p, valeur: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unité</label>
                <input type="text" placeholder="Ex: %, Mrd USD"
                  value={macro.unite}
                  onChange={e => setMacro(p => ({ ...p, unite: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Année *</label>
                <input type="number" placeholder="Ex: 2024"
                  value={macro.annee}
                  onChange={e => setMacro(p => ({ ...p, annee: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Source</label>
              <input type="text" placeholder="Ex: FMI, Banque Mondiale, BAD"
                value={macro.source}
                onChange={e => setMacro(p => ({ ...p, source: e.target.value }))}
                className={inputClass} />
            </div>

            <button onClick={submitMacro} disabled={loading}
              className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50">
              {loading ? 'Ajout...' : '+ Ajouter la donnée'}
            </button>
          </div>
        )}

        {/* ── TAUX ── */}
        {tab === 'taux' && (
          <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-white mb-2">Ajouter un taux de change</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Devise de base *</label>
                <input type="text" placeholder="Ex: XOF, NGN, KES"
                  value={taux.devise_base}
                  onChange={e => setTaux(p => ({ ...p, devise_base: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Devise cible *</label>
                <select value={taux.devise_cible}
                  onChange={e => setTaux(p => ({ ...p, devise_cible: e.target.value }))}
                  className={selectClass}>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar américain</option>
                  <option value="GBP">GBP — Livre sterling</option>
                  <option value="CNY">CNY — Yuan chinois</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Taux *</label>
                <input type="number" step="0.000001" placeholder="Ex: 0.001524"
                  value={taux.taux}
                  onChange={e => setTaux(p => ({ ...p, taux: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date *</label>
                <input type="date" value={taux.date_taux}
                  onChange={e => setTaux(p => ({ ...p, date_taux: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Source</label>
              <input type="text" placeholder="Ex: Banque Centrale, BCE"
                value={taux.source}
                onChange={e => setTaux(p => ({ ...p, source: e.target.value }))}
                className={inputClass} />
            </div>

            <button onClick={submitTaux} disabled={loading}
              className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50">
              {loading ? 'Ajout...' : '+ Ajouter le taux'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}