import PageHeader from '../components/PageHeader'

export default function Meals() {
  return (
    <div>
      <PageHeader title="급식" subtitle="오늘의 식단" />
      <div className="px-5">
        <div className="bg-widjet rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-muted">급식 위젯이 여기에 들어옵니다</p>
        </div>
      </div>
    </div>
  )
}
