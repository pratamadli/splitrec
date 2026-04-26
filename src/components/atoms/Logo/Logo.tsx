import Image from 'next/image'
import { cn } from '@/src/lib/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconSizes = { sm: 32, md: 40, lg: 56 }
const textClasses = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-4xl' }

export function Logo({ size = 'md', className }: LogoProps) {
  const iconSize = iconSizes[size]
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo-icon.png"
        alt="Splitrec"
        width={iconSize}
        height={iconSize}
        priority
        className="object-contain"
      />
      <span className={cn('font-bold leading-none', textClasses[size])}>
        <span className="text-brand-blue">Split</span>
        <span className="text-brand-green">rec</span>
      </span>
    </div>
  )
}
