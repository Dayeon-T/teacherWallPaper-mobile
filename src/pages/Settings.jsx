import { useNavigate } from 'react-router'
import { useStyle, THEME_COLORS, RADIUS_OPTIONS } from '../context/StyleContext'

export default function Settings() {
  const navigate = useNavigate()
  const { style, updateStyle, resetStyle } = useStyle()

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 bg-widjet shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p className="font-semibold">설정</p>
      </header>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <Section title="화면">
          <Row label="다크 모드" sub="어두운 배경으로 전환합니다">
            <Toggle
              checked={style.darkMode}
              onChange={(v) => updateStyle({ darkMode: v })}
            />
          </Row>
        </Section>

        <Section title="테마 색상" desc="버튼·강조에 쓰이는 색입니다">
          <div className="grid grid-cols-3 gap-3">
            {THEME_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => updateStyle({ primaryColor: c.value })}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl bg-widjet border transition ${
                  style.primaryColor === c.value
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-gray-100'
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: c.value }}
                />
                <span className="text-xs">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-widjet border border-gray-100">
            <span className="text-xs text-muted">직접 선택</span>
            <input
              type="color"
              value={style.primaryColor}
              onChange={(e) => updateStyle({ primaryColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-xs tabular-nums text-muted ml-auto">
              {style.primaryColor.toUpperCase()}
            </span>
          </div>
        </Section>

        <Section title="모서리 둥글기">
          <div className="grid grid-cols-3 gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => updateStyle({ cardRadius: r.value })}
                className={`py-3 bg-widjet border transition ${
                  style.cardRadius === r.value
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-gray-100'
                }`}
                style={{ borderRadius: `${r.value}px` }}
              >
                <span className="text-sm">{r.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <button
          onClick={resetStyle}
          className="w-full py-3 rounded-xl bg-widjet border border-gray-100 text-sm text-muted hover:text-text transition"
        >
          기본값으로 되돌리기
        </button>
      </div>
    </div>
  )
}

function Section({ title, desc, children }) {
  return (
    <section>
      <div className="mb-2.5 px-1">
        <p className="text-xs font-semibold text-muted">{title}</p>
        {desc && <p className="text-[11px] text-muted/80 mt-0.5">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function Row({ label, sub, children }) {
  return (
    <div className="bg-widjet rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full relative transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 left-0 w-6 h-6 rounded-full shadow transition-transform"
        style={{
          backgroundColor: '#ffffff',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}
