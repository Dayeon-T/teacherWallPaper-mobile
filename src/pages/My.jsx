import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../api/SignIn'
import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'

export default function My() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const meta = user?.user_metadata || {}

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div>
      <PageHeader title="마이" />
      <div className="px-5 flex flex-col gap-3">
        <div className="bg-widjet rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <Avatar src={meta.avatar_url} size={56} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{meta.name || '선생님'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>

        <MenuItem label="설정" onClick={() => navigate('/settings')} />

        <button
          onClick={handleLogout}
          className="bg-widjet rounded-2xl p-4 shadow-sm text-sm text-red-500 font-medium"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

function MenuItem({ label, onClick, placeholder }) {
  return (
    <button
      onClick={onClick}
      className="bg-widjet rounded-2xl p-4 shadow-sm flex items-center justify-between text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      {placeholder ? (
        <span className="text-xs text-muted">준비 중</span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </button>
  )
}
