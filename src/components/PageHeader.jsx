export default function PageHeader({ title, subtitle, right }) {
  return (
    <header className="px-5 pt-6 pb-4 flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
