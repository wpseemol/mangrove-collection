import { cn } from '@/lib/utils'

export function BrandLogo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img src="/assets/logo.png" alt="" width={44} height={44} className="size-11 rounded-sm bg-white object-contain" />
      <span className={cn('text-sm leading-tight font-medium text-brand', textClassName)}>
        Mangrove
        <br />
        Collection
      </span>
    </div>
  )
}
