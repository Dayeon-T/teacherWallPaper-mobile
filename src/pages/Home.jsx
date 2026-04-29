import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import HomeSchedule from '../components/HomeSchedule'
import HomeTodo from '../components/HomeTodo'

export default function Home() {
  const { user } = useAuth()
  const name = user?.user_metadata?.name || '선생님'
  const today = new Date()
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 ${['일','월','화','수','목','금','토'][today.getDay()]}요일`

  return (
    <div>
      <PageHeader title={`${name} 님`} subtitle={dateStr} />
      <div className="px-5 pb-6 flex flex-col gap-3">
        <HomeSchedule />
        <HomeTodo />
      </div>
    </div>
  )
}
