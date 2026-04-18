import Image from 'next/image'
import { cn } from '@/src/lib/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 100, md: 140, lg: 180 }

export function Logo({ size = 'md', className }: LogoProps) {
  const w = sizes[size]
  return (
    <Image
      src="/logo.png"
      alt="Splitrec"
      width={w}
      height={Math.round(w * 0.4)}
      priority
      className={cn('object-contain', className)}
    />
  )
}
