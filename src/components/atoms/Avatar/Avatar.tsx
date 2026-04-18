import { cn } from '@/src/lib/cn'
import { getInitials } from '@/src/lib/initials'
import { avatarColor } from '@/src/lib/colors'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const bg = avatarColor(name)
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-semibold text-white',
        size === 'sm' && 'h-7 w-7 text-xs',
        size === 'md' && 'h-9 w-9 text-sm',
        size === 'lg' && 'h-12 w-12 text-base',
        className
      )}
      style={{ backgroundColor: bg }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
