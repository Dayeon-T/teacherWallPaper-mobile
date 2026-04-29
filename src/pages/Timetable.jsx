import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchTimetable } from '../api/timetable'
import { fetchProfileRow } from '../api/settings'
import { useStyle } from '../context/StyleContext'
import PageHeader from '../components/PageHeader'

const DAY_LABELS = ['', '월', '화', '수', '목', '금']
const DEFAULT_PERIODS = [
  { label: '1교시', start: '08:20', enabled: true },
  { label: '2교시', start: '09:20', enabled: true },
  { label: '3교시', start: '10:20', enabled: true },
  { label: '4교시', start: '11:20', enabled: true },
  { label: '점심시간', start: '12:10', enabled: true },
  { label: '5교시', start: '13:00', enabled: true },
  { label: '6교시', start: '14:00', enabled: true },
  { label: '7교시', start: '15:00', enabled: true },
  { label: '방과후 A', start: '16:30', enabled: false },
  { label: '방과후 B', start: '18:20', enabled: false },
]

function getMondayStr() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${dd}`
}

function toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function shortLabel(label) {
  const m = label.match(/^(\d+)교시$/)
  if (m) return m[1]
  if (label === '점심시간') return '점심'
  if (label.startsWith('방과후')) return '방과후'
  return label
}

function hexToRgba(hex, alpha) {
  if (!hex) return null
  const m = hex.replace('#', '')
  if (m.length !== 6) return hex
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export default function Timetable() {
  const { user } = useAuth()
  const { style } = useStyle()
  const isDark = style.darkMode
  const now = useNow()
  const [tab, setTab] = useState('personal')
  const [entries, setEntries] = useState([])
  const [periods, setPeriods] = useState(DEFAULT_PERIODS)
  const [homeroomClass, setHomeroomClass] = useState(null)
  const [weeklyOverrides, setWeeklyOverrides] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const isClass = tab === 'class'
    const [tt, profile] = await Promise.all([
      fetchTimetable(user.id, isClass),
      fetchProfileRow(user.id),
    ])
    setEntries(tt.data || [])

    if (profile.data) {
      setHomeroomClass(profile.data.homeroom_class || null)
      const saved = profile.data.period_schedule
      if (Array.isArray(saved) && saved.length > 0) {
        setPeriods(
          DEFAULT_PERIODS.map((def, i) => ({
            label: saved[i]?.label || def.label,
            start: saved[i]?.start || def.start,
            enabled: saved[i]?.enabled ?? def.enabled,
          }))
        )
      }
      const wt = profile.data.weekly_timetable
      if (!isClass && wt && wt.week === getMondayStr() && wt.map) {
        setWeeklyOverrides(wt.map)
      } else {
        setWeeklyOverrides({})
      }
    }
    setLoading(false)
  }, [user, tab])

  useEffect(() => { load() }, [load])

  const todayDay = now.getDay()
  const isWeekend = todayDay === 0 || todayDay === 6

  const visiblePeriods = useMemo(
    () => periods.map((p, i) => ({ ...p, originalIndex: i + 1 })).filter((p) => p.enabled),
    [periods]
  )

  const { effectiveMap, effectiveSkipped } = useMemo(() => {
    const baseMap = {}
    const skipped = new Set()
    for (const e of entries) {
      baseMap[`${e.day}-${e.start_period}`] = e
      if (e.end_period > e.start_period) {
        for (let p = e.start_period + 1; p <= e.end_period; p++) {
          skipped.add(`${e.day}-${p}`)
        }
      }
    }

    const map = { ...baseMap }
    for (const [key, val] of Object.entries(weeklyOverrides)) {
      if (val === null) {
        delete map[key]
      } else {
        map[key] = val
        if (val.end_period > val.start_period) {
          for (let p = val.start_period + 1; p <= val.end_period; p++) {
            skipped.add(`${val.day ?? key.split('-')[0]}-${p}`)
          }
        }
      }
    }

    return { effectiveMap: map, effectiveSkipped: skipped }
  }, [entries, weeklyOverrides])

  const currentPeriodIdx = useMemo(() => {
    if (isWeekend) return -1
    const nowMin = now.getHours() * 60 + now.getMinutes()
    let idx = -1
    for (let i = 0; i < visiblePeriods.length; i++) {
      if (toMin(visiblePeriods[i].start) <= nowMin) idx = i
      else break
    }
    if (idx === -1) return -1
    const cur = visiblePeriods[idx]
    if (nowMin - toMin(cur.start) > 90) return -1
    return idx
  }, [visiblePeriods, now, isWeekend])

  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 (${['일','월','화','수','목','금','토'][todayDay]})`

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="시간표" subtitle={dateStr} />

      {homeroomClass && (
        <div className="px-5 mb-3 shrink-0">
          <div className="bg-gray-200/60 rounded-full p-1 flex">
            <SegButton active={tab === 'personal'} onClick={() => setTab('personal')}>
              내 시간표
            </SegButton>
            <SegButton active={tab === 'class'} onClick={() => setTab('class')}>
              담임반 {homeroomClass}
            </SegButton>
          </div>
        </div>
      )}

      <div className="px-3 pb-3 flex-1 min-h-0 flex flex-col">
        {loading ? (
          <p className="text-sm text-muted py-8 text-center">불러오는 중...</p>
        ) : visiblePeriods.length === 0 ? (
          <EmptyState text="시정표가 비어있어요" emoji="📭" />
        ) : (
          <Grid
            visiblePeriods={visiblePeriods}
            effectiveMap={effectiveMap}
            effectiveSkipped={effectiveSkipped}
            todayDay={todayDay}
            currentPeriodIdx={currentPeriodIdx}
            isWeekend={isWeekend}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  )
}

function Grid({ visiblePeriods, effectiveMap, effectiveSkipped, todayDay, currentPeriodIdx, isWeekend, isDark }) {
  const cells = []

  cells.push(
    <div key="head-corner" className="text-[10px] text-muted text-center py-1.5"></div>
  )
  for (let day = 1; day <= 5; day++) {
    const isToday = !isWeekend && day === todayDay
    cells.push(
      <div
        key={`head-${day}`}
        className={`text-xs font-semibold text-center py-1.5 rounded-md ${
          isToday ? 'bg-primary text-white' : 'text-muted'
        }`}
      >
        {DAY_LABELS[day]}
      </div>
    )
  }

  visiblePeriods.forEach((vp, rowIdx) => {
    const isLunch = vp.label === '점심시간'
    const isCurrentRow = rowIdx === currentPeriodIdx
    const gridRow = rowIdx + 2

    cells.push(
      <div
        key={`label-${vp.originalIndex}`}
        className={`flex flex-col items-center justify-center py-1 ${
          isCurrentRow ? 'text-primary' : 'text-muted'
        }`}
        style={{ gridRow, gridColumn: 1 }}
      >
        <span className="text-xs font-semibold leading-none">{shortLabel(vp.label)}</span>
        <span className="text-[9px] mt-0.5 opacity-70 tabular-nums">{vp.start}</span>
      </div>
    )

    if (isLunch) {
      cells.push(
        <div
          key={`lunch-${vp.originalIndex}`}
          className="bg-gray-100 rounded-md text-[10px] text-muted text-center py-1.5"
          style={{ gridRow, gridColumn: '2 / span 5' }}
        >
          점심시간
        </div>
      )
      return
    }

    for (let day = 1; day <= 5; day++) {
      const cellKey = `${day}-${vp.originalIndex}`
      if (effectiveSkipped.has(cellKey)) continue

      const entry = effectiveMap[cellKey]
      const span = entry ? entry.end_period - entry.start_period + 1 : 1
      const isToday = !isWeekend && day === todayDay
      const isCurrent = isToday && isCurrentRow

      const entryBg = entry?.color
        ? isDark
          ? hexToRgba(entry.color, 0.32)
          : entry.color
        : undefined
      const emptyBgClass = entry
        ? ''
        : isDark
          ? isToday
            ? 'bg-white/[0.06]'
            : 'bg-white/[0.03]'
          : isToday
            ? 'bg-gray-50'
            : 'bg-gray-50/50'

      cells.push(
        <div
          key={cellKey}
          className={`rounded-md flex flex-col items-center justify-center px-1 text-center overflow-hidden transition ${emptyBgClass} ${
            isCurrent ? 'ring-2 ring-primary' : ''
          }`}
          style={{
            gridRow: `${gridRow} / span ${span}`,
            gridColumn: day + 1,
            backgroundColor: entryBg,
            minHeight: 44,
          }}
        >
          {entry?.subject && (
            <span className="text-[11px] font-semibold leading-tight break-keep line-clamp-2 text-text">
              {entry.subject}
            </span>
          )}
          {entry?.room && (
            <span className="text-[9px] text-muted mt-0.5 truncate max-w-full">
              {entry.room}
            </span>
          )}
        </div>
      )
    }
  })

  return (
    <div
      className="bg-widjet rounded-2xl p-2.5 shadow-sm grid gap-1 flex-1 min-h-0"
      style={{
        gridTemplateColumns: '34px repeat(5, minmax(0, 1fr))',
        gridTemplateRows: `auto repeat(${visiblePeriods.length}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  )
}

function SegButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
        active ? 'bg-white shadow text-text' : 'text-muted'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyState({ text, emoji }) {
  return (
    <div className="bg-widjet rounded-2xl py-12 px-5 text-center shadow-sm mx-2">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  )
}
