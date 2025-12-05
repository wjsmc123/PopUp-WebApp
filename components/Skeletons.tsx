import type { ThemeClasses } from '@/types';
import { cn } from '@/lib/utils';

const DEFAULT_ROWS = 3;
const DEFAULT_ITEMS = 4;

interface ThemedProps {
  theme?: ThemeClasses;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('shimmer-block rounded-full', className)} />;
}

export function ScheduleSkeletonList({ rows = DEFAULT_ROWS, theme }: { rows?: number } & ThemedProps) {
  return (
    <div className="space-y-4 pl-4 border-l-2 border-dashed border-stone-200">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={`schedule-skeleton-${idx}`} className="relative">
          <div
            className={cn(
              'absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white',
              theme?.accentBg ?? 'bg-stone-300'
            )}
          ></div>
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-4 w-40 rounded-md" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductSkeletonGrid({ items = DEFAULT_ITEMS, theme }: { items?: number } & ThemedProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: items }).map((_, idx) => (
        <div
          key={`product-skeleton-${idx}`}
          className={cn(
            'bg-white border border-stone-200 overflow-hidden p-3 space-y-3',
            theme?.cardShape ?? 'rounded-xl'
          )}
        >
          <div className="aspect-square bg-stone-100 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-block" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-2 w-12" />
            <SkeletonBlock className="h-4 w-24 rounded-md" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton({ theme }: ThemedProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-2 animate-slide-up">
        <SkeletonBlock className="h-5 w-20" />
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-3 w-32" />
      </section>

      <section className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={`hero-card-${idx}`} className={cn('bg-white p-4 border border-stone-200 space-y-3', theme?.cardShape ?? 'rounded-xl')}>
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        ))}
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className={cn('h-48 w-full overflow-hidden border border-dashed border-stone-200', theme?.cardShape ?? 'rounded-3xl')}>
          <div className="h-full w-full shimmer-block" />
        </div>
      </section>

      <section className="space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <ScheduleSkeletonList theme={theme} rows={4} />
      </section>
    </div>
  );
}

export function ShopSkeleton({ theme }: ThemedProps) {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-2 animate-slide-up">
        <SkeletonBlock className="h-7 w-40 mx-auto" />
        <SkeletonBlock className="h-4 w-56 mx-auto" />
      </section>

      <div className="flex gap-4 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`shop-chip-${idx}`} className={cn('flex-1 h-10 border border-stone-200 bg-white flex items-center justify-center', theme?.cardShape ?? 'rounded-full')}>
            <SkeletonBlock className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ProductSkeletonGrid theme={theme} />
      </div>
    </div>
  );
}

export function PersonalSkeleton({ theme }: ThemedProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn('bg-stone-900 text-white p-6 relative overflow-hidden', theme?.cardShape ?? 'rounded-2xl')}>
        <SkeletonBlock className="h-3 w-12" />
        <SkeletonBlock className="h-10 w-24 mt-4" />
        <SkeletonBlock className="h-4 w-32 mt-2" />
        <div className="flex justify-between items-center mt-6">
          <div className="space-y-1">
            <SkeletonBlock className="h-2 w-12" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
          <div className="space-y-1 text-right">
            <SkeletonBlock className="h-2 w-12" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={`personal-card-${idx}`}
            className={cn('bg-white border border-stone-200 p-4 flex items-center justify-between', theme?.cardShape ?? 'rounded-xl')}
          >
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-4 w-32" />
            </div>
            <SkeletonBlock className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton({ theme }: ThemedProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <SkeletonBlock className="h-6 w-40" />
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={`settings-row-${idx}`}
          className={cn('bg-white border border-stone-200 p-4 flex items-center justify-between', theme?.cardShape ?? 'rounded-xl')}
        >
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
          <SkeletonBlock className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
}
