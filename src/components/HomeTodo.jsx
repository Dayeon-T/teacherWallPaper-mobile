import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  toggleImportant,
} from '../api/todos'

const SORT_MODES = [
  { id: 'important', label: '중요도순' },
  { id: 'due', label: '마감일순' },
  { id: 'newest', label: '최신순' },
]

function getDDayText(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-Day'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

function getDDayColor(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'text-gray-400'
  if (diff === 0) return 'text-red-500'
  if (diff <= 3) return 'text-amber-500'
  return 'text-blue-500'
}

export default function HomeTodo() {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [sortMode, setSortMode] = useState('important')

  const load = useCallback(async () => {
    if (!user) return
    const { data } = await fetchTodos(user.id)
    if (data) setTodos(data)
  }, [user])

  useEffect(() => { load() }, [load])

  const sortedTodos = useMemo(() => {
    const filtered = showCompleted ? todos : todos.filter((t) => !t.is_done)
    const sorted = [...filtered]
    if (sortMode === 'important') {
      sorted.sort((a, b) => {
        if (a.is_done !== b.is_done) return a.is_done ? 1 : -1
        const ai = a.is_important ? 1 : 0
        const bi = b.is_important ? 1 : 0
        if (bi !== ai) return bi - ai
        return (a.position ?? 0) - (b.position ?? 0)
      })
    } else if (sortMode === 'due') {
      sorted.sort((a, b) => {
        if (a.is_done !== b.is_done) return a.is_done ? 1 : -1
        const ad = a.due_date || '9999-12-31'
        const bd = b.due_date || '9999-12-31'
        if (ad !== bd) return ad.localeCompare(bd)
        return (a.position ?? 0) - (b.position ?? 0)
      })
    } else {
      sorted.sort((a, b) => {
        if (a.is_done !== b.is_done) return a.is_done ? 1 : -1
        const ac = a.created_at || ''
        const bc = b.created_at || ''
        return bc.localeCompare(ac)
      })
    }
    return sorted
  }, [todos, sortMode, showCompleted])

  const cycleSortMode = () => {
    const idx = SORT_MODES.findIndex((m) => m.id === sortMode)
    const next = SORT_MODES[(idx + 1) % SORT_MODES.length]
    setSortMode(next.id)
  }
  const currentSortLabel = SORT_MODES.find((m) => m.id === sortMode)?.label

  const handleAdd = async () => {
    const text = input.trim()
    if (!text || !user) return
    const maxPos = todos.length > 0 ? Math.max(...todos.map((t) => t.position ?? 0)) + 1 : 0
    await addTodo(user.id, text, maxPos, dueDate || null)
    setInput('')
    setDueDate('')
    await load()
  }

  const handleToggle = async (id, current) => {
    await toggleTodo(id, !current)
    await load()
  }

  const handleDelete = async (id) => {
    await deleteTodo(id)
    await load()
  }

  const handleImportant = async (id, current) => {
    await toggleImportant(id, !current)
    await load()
  }

  const completedCount = todos.filter((t) => t.is_done).length

  return (
    <div className="bg-widjet rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">할 일</p>
        <button
          onClick={cycleSortMode}
          className="text-[11px] text-muted flex items-center gap-1 hover:text-text transition"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          {currentSortLabel}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="할 일 추가"
          className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 min-w-0"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-gray-50 rounded-xl px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/40 w-[7rem] shrink-0"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="bg-primary text-white rounded-xl px-3 text-sm font-semibold shrink-0 disabled:opacity-40"
        >
          +
        </button>
      </div>

      {sortedTodos.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">
          {showCompleted ? '할 일이 없어요' : '오늘도 깔끔하네요 ✨'}
        </p>
      ) : (
        <ul className="flex flex-col">
          {sortedTodos.map((todo) => {
            const ddayText = getDDayText(todo.due_date)
            const ddayColor = getDDayColor(todo.due_date)
            return (
              <li
                key={todo.id}
                className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 last:border-b-0"
              >
                <button
                  onClick={() => handleToggle(todo.id, todo.is_done)}
                  className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition"
                  style={{
                    borderColor: todo.is_done ? '#2b2b2b' : '#ccc',
                    backgroundColor: todo.is_done ? '#2b2b2b' : 'transparent',
                  }}
                >
                  {todo.is_done && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <span
                  className={`flex-1 text-sm min-w-0 truncate ${
                    todo.is_done ? 'line-through text-muted' : ''
                  }`}
                >
                  {todo.content}
                </span>

                {ddayText && (
                  <span className={`text-[10px] font-semibold shrink-0 ${ddayColor}`}>
                    {ddayText}
                  </span>
                )}

                <button
                  onClick={() => handleImportant(todo.id, todo.is_important)}
                  className="shrink-0 leading-none"
                >
                  {todo.is_important ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="shrink-0 text-gray-300 hover:text-text transition text-lg leading-none w-5 text-center"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {completedCount > 0 && (
        <button
          onClick={() => setShowCompleted((v) => !v)}
          className="w-full mt-3 text-[11px] text-muted hover:text-text transition py-1"
        >
          {showCompleted ? '완료된 항목 숨기기' : `완료된 ${completedCount}개 보기`}
        </button>
      )}
    </div>
  )
}
