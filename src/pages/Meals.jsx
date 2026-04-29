import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { NEIS_KEY } from '../api/neis'
import PageHeader from '../components/PageHeader'

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getDayLabel(date) {
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const diff = Math.round((target - today) / 86400000)
  if (diff === 0) return '오늘'
  if (diff === -1) return '어제'
  if (diff === 1) return '내일'
  const dow = ['일', '월', '화', '수', '목', '금', '토'][target.getDay()]
  return `${target.getMonth() + 1}/${target.getDate()} (${dow})`
}

function splitDish(raw) {
  const m = raw.trim().match(/^(.*?)\s*\(([\d.\s]+)\)\s*$/)
  if (m) return { name: m[1].trim(), allergens: m[2].trim() }
  return { name: raw.trim(), allergens: '' }
}

function getCalendarGrid(year, month) {
  const first = new Date(year, month, 1)
  const startDow = first.getDay()
  const start = new Date(first)
  start.setDate(start.getDate() - startDow)
  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d)
    if (i >= 27 && d.getMonth() !== month && d.getDay() === 6) break
  }
  return days
}

export default function Meals() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [lunch, setLunch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const atptCode = user?.user_metadata?.atpt_code
  const schoolCode = user?.user_metadata?.school_code

  const fetchMeals = useCallback(async () => {
    if (!atptCode || !schoolCode) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError('')
      setLunch(null)

      const url =
        `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_KEY}&Type=json&pIndex=1&pSize=10` +
        `&MLSV_YMD=${formatYmd(selectedDate)}&ATPT_OFCDC_SC_CODE=${atptCode}&SD_SCHUL_CODE=${schoolCode}`

      const response = await fetch(url)
      const data = await response.json()
      const rows = data.mealServiceDietInfo?.[1]?.row ?? []
      const lunchRow = rows.find((meal) => meal.MMEAL_SC_NM === '중식')

      if (lunchRow) {
        setLunch({
          dishes: lunchRow.DDISH_NM.split('<br/>').map(splitDish).filter((d) => d.name),
          calories: lunchRow.CAL_INFO,
        })
      }
    } catch (e) {
      console.error(e)
      setError('급식 정보를 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, atptCode, schoolCode])

  useEffect(() => { fetchMeals() }, [fetchMeals])

  const calendarDays = useMemo(
    () => getCalendarGrid(calendarMonth.year, calendarMonth.month),
    [calendarMonth]
  )

  const today = startOfDay(new Date())

  const goPrevMonth = () => {
    setCalendarMonth(({ year, month }) => {
      const d = new Date(year, month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }
  const goNextMonth = () => {
    setCalendarMonth(({ year, month }) => {
      const d = new Date(year, month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }
  const goToday = () => {
    setSelectedDate(today)
    setCalendarMonth({ year: today.getFullYear(), month: today.getMonth() })
  }

  if (!atptCode || !schoolCode) {
    return (
      <div>
        <PageHeader title="급식" />
        <div className="px-5">
          <div className="bg-widjet rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-2">🏫</div>
            <p className="text-sm text-muted">학교 정보를 설정해주세요</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="급식" />

      <div className="px-5 mb-4">
        <div className="bg-widjet rounded-full shadow-sm flex items-center justify-between px-2 py-1.5">
          <NavButton onClick={() => setSelectedDate((d) => addDays(d, -1))} aria-label="이전">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </NavButton>
          <button
            onClick={goToday}
            className="text-sm font-semibold text-text px-3 py-1 rounded-full hover:bg-gray-50 transition"
          >
            {getDayLabel(selectedDate)}
          </button>
          <NavButton onClick={() => setSelectedDate((d) => addDays(d, 1))} aria-label="다음">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </NavButton>
        </div>
      </div>

      <div className="px-5 pb-4">
        {loading ? (
          <Card>
            <p className="text-sm text-muted text-center py-6">불러오는 중...</p>
          </Card>
        ) : error ? (
          <Card>
            <p className="text-sm text-muted text-center py-6">{error}</p>
          </Card>
        ) : !lunch ? (
          <Card>
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🍽️</div>
              <p className="text-sm text-muted">급식 정보가 없어요</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🥗</span>
              <p className="text-sm font-semibold">중식</p>
            </div>
            <ul className="flex flex-col gap-2">
              {lunch.dishes.map((dish, i) => (
                <li
                  key={i}
                  className="text-sm text-text leading-snug pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.55rem] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/40"
                >
                  <span>{dish.name}</span>
                  {dish.allergens && (
                    <span className="ml-1.5 text-[11px] text-muted tabular-nums">
                      ({dish.allergens})
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {lunch.calories && (
              <p className="mt-5 pt-4 border-t border-gray-100 text-xs text-muted flex items-center gap-1">
                🔥 {lunch.calories}
              </p>
            )}
          </Card>
        )}
      </div>

      <div className="px-5 pb-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <button onClick={goPrevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <p className="text-sm font-semibold tabular-nums">
              {calendarMonth.year}년 {calendarMonth.month + 1}월
            </p>
            <button onClick={goNextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d) => {
              const inMonth = d.getMonth() === calendarMonth.month
              const isToday = isSameDay(d, today)
              const isSelected = isSameDay(d, selectedDate)
              const dow = d.getDay()
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(startOfDay(d))}
                  className={`aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center ${
                    isSelected
                      ? 'bg-primary text-white shadow'
                      : isToday
                        ? 'bg-primary/10 text-primary'
                        : !inMonth
                          ? 'text-gray-300'
                          : dow === 0
                            ? 'text-red-400'
                            : dow === 6
                              ? 'text-blue-400'
                              : 'text-text'
                  } ${!isSelected && inMonth ? 'hover:bg-gray-100' : ''}`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Card({ children }) {
  return <div className="bg-widjet rounded-2xl p-5 shadow-sm">{children}</div>
}

function NavButton({ children, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full flex items-center justify-center text-text hover:bg-gray-100 transition"
      {...props}
    >
      {children}
    </button>
  )
}
