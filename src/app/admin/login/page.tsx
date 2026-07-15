'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const resJson = await response.json()

      if (!response.ok) {
        throw new Error(resJson.message || 'Email atau password salah')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block text-2xl font-extrabold tracking-tight text-white mb-6 hover:text-primary transition-colors">
          FUN<span className="text-primary">RUN</span>
        </Link>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-elevated">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-secondary tracking-tight">
              LOGIN ADMIN
            </h2>
            <p className="text-[14px] text-text-secondary mt-1">
              Masukkan kredensial Anda untuk mengakses panel administrasi.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-danger/10 border border-danger text-danger p-3 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[14px] font-medium text-text-primary mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.com"
                className="w-full px-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary placeholder-gray-400 text-sm transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[14px] font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 h-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00] text-text-primary placeholder-gray-400 text-sm transition-all"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:bg-[#E64500] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
              >
                {isLoading ? 'Mengecek...' : 'Login Admin'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <Link href="/" className="text-xs text-primary hover:underline font-semibold">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
