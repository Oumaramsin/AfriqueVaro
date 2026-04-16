'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const schema = z.object({
  full_name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm: z.string()
}).refine(d => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm']
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setEmail(data.email)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } }
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-white mb-2">Vérifie ta boîte mail !</h2>
        <p className="text-gray-400 mb-6">
          Lien de confirmation envoyé à <strong className="text-[#C8A951]">{email}</strong>
        </p>
        <Link href="/login" className="text-[#C8A951] hover:underline text-sm">
          Aller à la connexion →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">
            Afrique<span className="text-[#C8A951]">Varo</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            L&apos;information économique africaine
          </p>
        </div>

        <div className="bg-[#141414] rounded-2xl border border-white/5 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Créer un compte</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Nom complet</label>
              <input {...register('full_name')} type="text" placeholder="Jean Dupont"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm" />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Email</label>
              <input {...register('email')} type="email" placeholder="jean@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Mot de passe</label>
              <input {...register('password')} type="password" placeholder="Minimum 8 caractères"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Confirme le mot de passe</label>
              <input {...register('confirm')} type="password" placeholder="Répète ton mot de passe"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C8A951] text-sm" />
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#C8A951] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#E2C97E] transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#C8A951] hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}