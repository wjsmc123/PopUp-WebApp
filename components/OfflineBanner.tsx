'use client';

import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  return (
    <div className="bg-stone-800 text-stone-300 text-[10px] uppercase font-bold tracking-widest py-2 text-center flex items-center justify-center gap-2 animate-slide-down sticky top-0 z-[60]">
      <WifiOff size={12} />
      Offline Mode • Cached
    </div>
  );
}
