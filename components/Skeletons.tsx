'use client';

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
