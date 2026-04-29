import { useAuth } from '../context/AuthContext'
import { signOut } from '../api/SignIn'
import PageHeader from '../components/PageHeader'

export default function My() {
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
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
            {meta.avatar_url ? (
              <img src={meta.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{meta.name || '선생님'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>

        <MenuItem label="쪽지함" placeholder />
        <MenuItem label="설정" placeholder />

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

function MenuItem({ label, placeholder }) {
  return (
    <button className="bg-widjet rounded-2xl p-4 shadow-sm flex items-center justify-between text-left">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted">
        {placeholder ? '준비 중' : ''}
      </span>
    </button>
  )
}
