import PageHeader from '../components/PageHeader'

export default function Todo() {
  return (
    <div>
      <PageHeader title="할 일" subtitle="오늘 처리할 것들" />
      <div className="px-5 flex flex-col gap-3">
        <div className="bg-widjet rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-muted">투두 위젯이 여기에 들어옵니다</p>
        </div>
        <div className="bg-widjet rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold mb-2">바로가기 폴더</p>
          <p className="text-xs text-muted">폴더(북마크) 위젯이 여기에 들어옵니다</p>
        </div>
      </div>
    </div>
  )
}
