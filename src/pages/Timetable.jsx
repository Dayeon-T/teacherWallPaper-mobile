import PageHeader from '../components/PageHeader'

export default function Timetable() {
  return (
    <div>
      <PageHeader title="시간표" subtitle="이번 주 수업" />
      <div className="px-5 flex flex-col gap-3">
        <div className="bg-widjet rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-muted">시간표 위젯이 여기에 들어옵니다</p>
        </div>
        <div className="bg-widjet rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold mb-2">학사일정</p>
          <p className="text-xs text-muted">학사일정 위젯이 여기에 들어옵니다</p>
        </div>
      </div>
    </div>
  )
}
