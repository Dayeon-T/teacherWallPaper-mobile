import { NavLink, Outlet } from 'react-router'

const TABS = [
  { to: '/', label: '홈', icon: HomeIcon, end: true },
  { to: '/timetable', label: '시간표', icon: CalendarIcon },
  { to: '/todo', label: '할 일', icon: CheckIcon },
  { to: '/meals', label: '급식', icon: MealIcon },
  { to: '/my', label: '마이', icon: UserIcon },
]

export default function TabLayout() {
  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+72px)]">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around h-[64px]">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}
function CalendarIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
      <path d="M3 9h18" stroke={active ? '#fff' : 'currentColor'} />
      <path d="M8 3v4M16 3v4" />
    </svg>
  )
}
function CheckIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m8 12 3 3 5-6" stroke={active ? '#fff' : 'currentColor'} />
    </svg>
  )
}
function MealIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11h16a0 0 0 0 1 0 0 8 8 0 0 1-16 0z" />
      <path d="M2 19h20" />
      <path d="M7 4v3M12 4v3M17 4v3" />
    </svg>
  )
}
function UserIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}
