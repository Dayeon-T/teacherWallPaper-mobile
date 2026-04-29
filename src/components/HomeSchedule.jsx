import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { NEIS_KEY } from '../api/neis'
import { fetchSchoolEvents } from '../api/schoolEvents'

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
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
  }
  return days
}

export default function HomeSchedule() {
  const { user } = useAuth()
  const [monthOffset, setMonthOffset] = useState(0)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [monthInfo, setMonthInfo] = useState({ year: 0, month: 0 })

  const atptCode = user?.user_metadata?.atpt_code
  const schoolCode = user?.user_metadata?.school_code

  const fetchSchedule = useCallback(async () => {
    if (!atptCode || !schoolCode) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const now = new Date()
      const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
      const year = target.getFullYear()
      const month = target.getMonth()
      setMonthInfo({ year, month })

      const gridStart = new Date(year, month, 1)
      gridStart.setDate(1 - gridStart.getDay())
      const gridEnd = new Date(gridStart)
      gridEnd.setDate(gridEnd.getDate() + 41)

      const fromStr = formatYmd(gridStart)
      const toStr = formatYmd(gridEnd)

      const [neisRes, customRes] = await Promise.all([
        fetch(
          `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${NEIS_KEY}&Type=json&pIndex=1&pSize=500` +
          `&ATPT_OFCDC_SC_CODE=${atptCode}&SD_SCHUL_CODE=${schoolCode}` +
          `&AA_FROM_YMD=${fromStr}&AA_TO_YMD=${toStr}`
        ).then((r) => r.json()),
        fetchSchoolEvents(atptCode, schoolCode),
      ])

      const neisRows = neisRes.SchoolSchedule?.[1]?.row ?? []
      const neisMapped = neisRows
        .filter((r) => r.EVENT_NM !== '토요휴업일')
        .map((r) => ({
          date: r.AA_YMD,
          end_date: null,
          name: r.EVENT_NM,
          source: 'neis',
        }))

      const customFiltered = (customRes.data || [])
        .filter((e) => {
          const start = e.date
          const end = e.end_date || e.date
          return start <= toStr && end >= fromStr
        })
        .map((e) => ({
          date: e.date,
          end_date: e.end_date || null,
          name: e.name,
          source: 'custom',
        }))

      const merged = [...neisMapped, ...customFiltered]
        .filter((v, i, a) => a.findIndex((t) => t.date === v.date && t.name === v.name) === i)
        .sort((a, b) => a.date.localeCompare(b.date))

      setEvents(merged)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [monthOffset, atptCode, schoolCode])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  const eventsByDate = useMemo(() => {
    const map = {}
    for (const ev of events) {
      const start = ev.date
      const end = ev.end_date || ev.date
      const startD = new Date(
        Number(start.slice(0, 4)),
        Number(start.slice(4, 6)) - 1,
        Number(start.slice(6, 8))
      )
      const endD = new Date(
        Number(end.slice(0, 4)),
        Number(end.slice(4, 6)) - 1,
        Number(end.slice(6, 8))
      )
      const cur = new Date(startD)
      while (cur <= endD) {
        const key = formatYmd(cur)
        if (!map[key]) map[key] = []
        map[key].push(ev)
        cur.setDate(cur.getDate() + 1)
      }
    }
    return map
  }, [events])

  const calendarDays = useMemo(
    () => getCalendarGrid(monthInfo.year, monthInfo.month),
    [monthInfo]
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatYmd(today)

  if (!atptCode || !schoolCode) {
    return (
      <div className="bg-widjet rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-semibold mb-2">학사일정</p>
        <p className="text-xs text-muted">학교 정보를 설정해주세요</p>
      </div>
    )
  }

  return (
    <div className="bg-widjet rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">학사일정</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((p) => p - 1)}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-xs font-semibold tabular-nums min-w-[4em] text-center">
            {monthInfo.year}.{String(monthInfo.month + 1).padStart(2, '0')}
          </span>
          <button
            onClick={() => setMonthOffset((p) => p + 1)}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 relative">
        {loading ? (
          <div className="col-span-7 py-8 text-center text-xs text-muted">불러오는 중...</div>
        ) : (
          calendarDays.map((d) => {
            const dStr = formatYmd(d)
            const inMonth = d.getMonth() === monthInfo.month
            const isToday = dStr === todayStr
            const dow = d.getDay()
            const dayEvents = eventsByDate[dStr] || []

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDay(dStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-start py-1.5 transition ${
                  isToday ? 'bg-primary text-white' : !inMonth ? 'text-gray-300' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className={`text-xs font-medium leading-none ${
                    isToday
                      ? ''
                      : !inMonth
                        ? ''
                        : dow === 0
                          ? 'text-red-400'
                          : dow === 6
                            ? 'text-blue-400'
                            : 'text-text'
                  }`}
                >
                  {d.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <span
                        key={j}
                        className={`w-1 h-1 rounded-full ${
                          isToday
                            ? 'bg-white/80'
                            : ev.source === 'custom'
                              ? 'bg-primary'
                              : 'bg-gray-400'
                        }`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={`text-[8px] leading-none ${isToday ? 'text-white/80' : 'text-gray-400'}`}>
                        +
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {selectedDay && (
        <DayDetail
          dayStr={selectedDay}
          events={eventsByDate[selectedDay] || []}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

function DayDetail({ dayStr, events, onClose }) {
  const y = dayStr.slice(0, 4)
  const m = Number(dayStr.slice(4, 6))
  const d = Number(dayStr.slice(6, 8))

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-8 animate-[slideUp_0.2s_ease-out]"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <p className="font-semibold mb-3">
          {y}년 {m}월 {d}일
        </p>
        {events.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">일정이 없어요 🗓️</p>
        ) : (
          <ul className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
            {events.map((ev, i) => (
              <li key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-gray-50">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    ev.source === 'custom' ? 'bg-primary' : 'bg-gray-400'
                  }`}
                />
                <p className="text-sm text-text flex-1">{ev.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
