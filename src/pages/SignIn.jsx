import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { signIn } from '../api/SignIn'

export default function SignIn() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: err, errorMessage } = await signIn(email, password)
    setSubmitting(false)
    if (err) {
      setError(errorMessage)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">플랜스쿨 모바일</h1>
        <p className="text-sm text-muted text-center mb-8">로그인하고 시작해요</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            required
            className="bg-widjet rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
            className="bg-widjet rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && <p className="text-xs text-red-500 px-1">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white rounded-2xl py-3.5 text-sm font-semibold mt-2 disabled:opacity-50"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
