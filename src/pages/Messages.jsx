import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import {
  fetchConversationList,
  fetchConversation,
  sendCheer,
  markAllAsRead,
  subscribeToCheer,
} from '../api/cheers'
import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'

export default function Messages() {
  const { partnerId } = useParams()
  if (partnerId) return <ChatRoom partnerId={partnerId} />
  return <ConversationList />
}

function ConversationList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const data = await fetchConversationList(user.id)
    setList(data)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load, location.key])

  useEffect(() => {
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [load])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToCheer(user.id, () => load(), () => load())
    return unsub
  }, [user, load])

  return (
    <div>
      <PageHeader title="쪽지" />
      <div className="px-3">
        {loading && <p className="text-sm text-muted px-2 py-4">불러오는 중...</p>}
        {!loading && list.length === 0 && (
          <div className="text-center py-16">
            <div className="text-3xl mb-2">💌</div>
            <p className="text-sm text-muted">아직 주고받은 쪽지가 없어요</p>
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {list.map((c) => {
            const mine = c.lastMessage.from_id === user?.id
            return (
              <li key={c.partnerId}>
                <button
                  onClick={() => navigate(`/messages/${c.partnerId}`)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-widjet active:bg-widjet transition text-left"
                >
                  <Avatar src={c.partnerAvatar} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <p className="font-semibold truncate text-[15px] text-text">
                        {c.partnerName || '익명'}
                      </p>
                      <span className="text-[11px] text-muted shrink-0 tabular-nums">
                        {formatTime(c.lastMessage.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          c.unread > 0 ? 'text-text' : 'text-muted'
                        }`}
                      >
                        {mine && <span className="text-muted">나: </span>}
                        {c.lastMessage.message}
                      </p>
                      {c.unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center shrink-0">
                          {c.unread > 99 ? '99+' : c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function ChatRoom({ partnerId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const scrollRef = useRef(null)
  const didInitialScrollRef = useRef(false)

  const load = useCallback(async () => {
    if (!user) return
    const { data } = await fetchConversation(user.id, partnerId)
    setMessages(data)
    const fromOther = data.find((m) => m.from_id === partnerId)
    if (fromOther) setPartnerName(fromOther.from_name || '')
    await markAllAsRead(user.id)
  }, [user, partnerId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToCheer(user.id, () => load(), () => load())
    return unsub
  }, [user, load])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || messages.length === 0) return
    if (!didInitialScrollRef.current) {
      el.scrollTop = el.scrollHeight
      didInitialScrollRef.current = true
      return
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 120) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || !user) return
    setInput('')
    const fromName = user.user_metadata?.name || '익명'
    await sendCheer(user.id, fromName, partnerId, text)
    load()
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 bg-white shrink-0">
        <button onClick={() => navigate('/messages')} className="p-2 -ml-2 text-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p className="font-semibold">{partnerName || '대화'}</p>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
        {messages.map((m, i) => {
          const mine = m.from_id === user?.id
          const prev = messages[i - 1]
          const next = messages[i + 1]
          const sameMinuteAsNext =
            next &&
            next.from_id === m.from_id &&
            new Date(next.created_at).getTime() - new Date(m.created_at).getTime() < 60_000
          const showDateSep =
            !prev ||
            new Date(prev.created_at).toDateString() !==
              new Date(m.created_at).toDateString()
          return (
            <div key={m.id} className="contents">
              {showDateSep && (
                <div className="self-center text-[10px] text-muted my-2">
                  {formatDateSep(m.created_at)}
                </div>
              )}
              <div
                className={`max-w-[78%] flex items-end gap-1.5 ${
                  mine ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm break-words ${
                    mine ? 'bg-primary text-white' : 'bg-gray-100 text-text'
                  }`}
                >
                  {m.message}
                </div>
                {!sameMinuteAsNext && (
                  <span className="text-[10px] text-muted shrink-0 mb-0.5 tabular-nums">
                    {formatBubbleTime(m.created_at)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <form
        onSubmit={handleSend}
        className="border-t border-gray-100 bg-white p-3 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-primary text-white rounded-full px-5 text-sm font-semibold disabled:opacity-40"
        >
          보내기
        </button>
      </form>
    </div>
  )
}

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return `${diffDays}일 전`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatBubbleTime(iso) {
  const d = new Date(iso)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${h12}:${m}`
}

function formatDateSep(iso) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return '오늘'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return '어제'
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${['일','월','화','수','목','금','토'][d.getDay()]}요일`
}
