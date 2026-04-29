export default function Avatar({ src, size = 40 }) {
  const iconSize = Math.round(size * 0.55)
  return (
    <div
      className="rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400 shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )}
    </div>
  )
}
