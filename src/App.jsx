import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from './context/AuthContext'
import TabLayout from './components/TabLayout'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import Timetable from './pages/Timetable'
import Messages from './pages/Messages'
import Meals from './pages/Meals'
import My from './pages/My'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm">
        불러오는 중...
      </div>
    )
  }
  if (!user) return <Navigate to="/signin" replace />
  return children
}

export default function App() {
  return (
    <div className="fixed inset-0 bg-bg text-text overflow-hidden">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TabLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:partnerId" element={<Messages />} />
          <Route path="meals" element={<Meals />} />
          <Route path="my" element={<My />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
