'use client'

import { useTheme } from '@/src/providers/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="h-8 w-8 flex items-center justify-center rounded-full text-brand-gray hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
