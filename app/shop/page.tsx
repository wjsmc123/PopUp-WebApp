'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ProductSkeletonGrid } from '@/components/Skeletons';
import { useAuthStore } from '@/lib/store/authStore';
import { getProducts } from '@/app/actions';
import { getThemeClasses } from '@/lib/utils';
import type { Product } from '@/types';

export default function ShopPage() {
  const router = useRouter();
  const { user, eventData } = useAuthStore();
  const [clientLoading, setClientLoading] = useState(true);
  const eventId = user?.eventId;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setClientLoading(false);
  }, [user, router]);

  const {
    data: products = [],
    isLoading,
    isFetching,
  } = useQuery<Product[]>({
    queryKey: ['products', eventId],
    queryFn: () => getProducts(eventId || ''),
    enabled: Boolean(eventId),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  if (!user || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <LoadingScreen />
      </div>
    );
  }

  const theme = getThemeClasses(eventData.theme);
  const showSkeleton = (isLoading || isFetching || clientLoading) && products.length === 0;

  return (
    <DashboardLayout>
      <section className="text-center space-y-2 mb-8 animate-slide-up">
        <h2 className={`text-3xl ${theme.fontHeading}`}>Curated Store</h2>
        <p className="text-sm text-stone-500">Exclusive merchandise from our partners.</p>
      </section>

      {/* Sponsors */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {['Rolex', 'Pirelli', 'Moët & Chandon'].map((sponsor, i) => (
          <div
            key={i}
            className={`flex-shrink-0 h-10 px-6 border border-stone-200 bg-white flex items-center justify-center text-xs font-serif italic text-stone-400 ${theme.cardShape} hover:border-stone-400 transition-colors cursor-default`}
          >
            {sponsor}
          </div>
        ))}
      </div>

      {/* Products Grid */}
      {showSkeleton ? (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <ProductSkeletonGrid theme={theme} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {products.length === 0 ? (
            <div className="col-span-2 text-center text-stone-400 text-xs py-12">
              Store inventory updating...
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className={`bg-white border border-stone-200 overflow-hidden group ${theme.cardShape} hover:shadow-lg transition-all duration-300`}
              >
                <div className={`aspect-square ${product.image.startsWith('http') ? '' : product.image} relative flex items-center justify-center bg-stone-100`}>
                  {product.image.startsWith('http') ? (
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  ) : (
                    <ShoppingBag className="text-stone-400 opacity-50 transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <div className="absolute top-2 right-2 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                    NEW
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">{product.brand}</p>
                  <h4 className={`text-sm font-medium leading-tight my-1 ${theme.fontHeading}`}>
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-xs">£{product.price}</span>
                    <button className={`p-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white transition-colors ${theme.buttonShape}`}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
