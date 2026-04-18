const AVATAR_COLORS = [
  '#1B3A7A', // brand-blue
  '#4A8FD4', // brand-blue-light
  '#5CBF2A', // brand-green
  '#7C3AED', // purple
  '#DB2777', // pink
  '#D97706', // amber
  '#0891B2', // cyan
  '#16A34A', // green
]

export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
