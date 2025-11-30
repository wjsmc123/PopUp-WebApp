'use client';

import { useEffect, useState } from 'react';
import { Home, ShoppingBag, User, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { ThemeClasses } from '@/types';

interface BottomDockProps {
  theme: ThemeClasses;
}

export function BottomDock({ theme }: BottomDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/personal', icon: User, label: 'Personal' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`bg-white/90 backdrop-blur-lg px-6 py-3 flex items-center gap-8 ${theme.dock}`}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center gap-1 group transition-all ${
                isActive ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-100'
              }`}
              aria-label={label}
            >
              <Icon
                size={20}
                className={isActive ? theme.accentText : 'text-stone-900'}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
