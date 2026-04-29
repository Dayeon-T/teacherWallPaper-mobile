import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'mobile_style_v1'

export const THEME_COLORS = [
  { id: 'gray', label: '기본', value: '#4A4A4A' },
  { id: 'blue', label: '하늘', value: '#3B82F6' },
  { id: 'green', label: '풀잎', value: '#10B981' },
  { id: 'pink', label: '벚꽃', value: '#EC4899' },
  { id: 'orange', label: '귤', value: '#F59E0B' },
  { id: 'purple', label: '라벤더', value: '#8B5CF6' },
]

export const RADIUS_OPTIONS = [
  { id: 'sharp', label: '각짐', value: 8 },
  { id: 'normal', label: '기본', value: 16 },
  { id: 'round', label: '둥글', value: 24 },
]

const DEFAULT_STYLE = {
  darkMode: false,
  primaryColor: '#4A4A4A',
  cardRadius: 16,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STYLE
    return { ...DEFAULT_STYLE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STYLE
  }
}

function saveToStorage(style) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(style))
  } catch {
    /* ignore quota errors */
  }
}

function applyStyle(style) {
  const root = document.documentElement
  root.setAttribute('data-theme', style.darkMode ? 'dark' : 'light')
  root.style.setProperty('--color-primary', style.primaryColor)
  root.style.setProperty('--card-radius', `${style.cardRadius}px`)
}

const StyleContext = createContext(null)

export function StyleProvider({ children }) {
  const [style, setStyle] = useState(loadFromStorage)

  useEffect(() => {
    applyStyle(style)
    saveToStorage(style)
  }, [style])

  const updateStyle = useCallback((patch) => {
    setStyle((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetStyle = useCallback(() => {
    setStyle(DEFAULT_STYLE)
  }, [])

  return (
    <StyleContext.Provider value={{ style, updateStyle, resetStyle }}>
      {children}
    </StyleContext.Provider>
  )
}

export function useStyle() {
  const ctx = useContext(StyleContext)
  if (!ctx) throw new Error('useStyle must be used within StyleProvider')
  return ctx
}
