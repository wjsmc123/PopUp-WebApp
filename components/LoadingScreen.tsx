'use client';

import { Loader2 } from 'lucide-react';
import type { ThemeClasses } from '@/types';

interface LoadingScreenProps {
  theme?: ThemeClasses;
}

export function LoadingScreen({ theme }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <Loader2 
        className={`animate-spin mb-4 ${theme ? theme.accentText : 'text-stone-400'}`} 
        size={32} 
      />
      <p className="text-xs font-mono text-stone-400 uppercase tracking-widest animate-pulse">
        Synchronizing...
      </p>
    </div>
  );
}
