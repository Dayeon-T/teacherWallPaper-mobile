import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'

export default function Home() {
  const { user } = useAuth()
  const name = user?.user_metadata?.name || '선생님'
  const today = new Date()
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 ${['일','월','화','수','목','금','토'][today.getDay()]}요일`

  return (
    <div>
      <PageHeader title={`${name} 님`} subtitle={dateStr} />
      <div className="px-5 flex flex-col gap-3">
        <Card title="시계 · 날씨" placeholder />
        <Card title="오늘의 D-Day" placeholder />
        <Card title="응원 보내기" placeholder />
      </div>
    </div>
  )
}

function Card({ title, placeholder }) {
  return (
    <div className="bg-widjet rounded-2xl p-5 shadow-sm">
      <p className="text-sm font-semibold mb-2">{title}</p>
      {placeholder && <p className="text-xs text-muted">곧 들어올 자리예요</p>}
    </div>
  )
}
