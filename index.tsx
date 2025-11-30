
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Wind, Thermometer, CloudSun, MapPin, Bell, Search, 
  ShoppingBag, User, Home, Settings, ChevronRight, 
  CreditCard, Calendar, Coffee, Music, Flag, LogOut,
  ToggleLeft, ToggleRight, Map, Loader2, RefreshCw,
  Wifi, WifiOff, ArrowLeft, Database, ShieldCheck
} from 'lucide-react';

// --- CONFIGURATION ---
// ⚠️ PASTE YOUR SUPABASE CREDENTIALS HERE
// The app will error in the console if these are missing.
const SUPABASE_URL = ''; 
const SUPABASE_KEY = '';

// --- CLIENT MANAGEMENT ---
let supabaseInstance: SupabaseClient | null = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Supabase Credentials Missing: Please edit index.tsx and add your SUPABASE_URL and SUPABASE_KEY.");
    // We return null here to let specific API calls throw the specific error, 
    // or we could throw immediately depending on preference.
    return null;
  }

  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
    return supabaseInstance;
  } catch (e) {
    console.error("Supabase Initialization Error:", e);
    throw e;
  }
};

// --- TYPES & INTERFACES ---

type EventTheme = 'silverstone' | 'monaco' | 'glastonbury';

interface EventConfig {
  id: string;
  name: string;
  theme: EventTheme;
  location: string;
  coordinates: string;
  weather: { temp: number; wind: number; condition: string };
}

interface UserProfile {
  id: string;
  bookingRef: string;
  firstName: string;
  lastName: string;
  eventId: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  currentTab: number;
  whatsapp?: string;
}

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  type: string;
  active: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  brand: string;
  image: string;
}

// --- DATA MAPPING HELPERS (DB Snake_case -> UI CamelCase) ---

const mapProfile = (data: any): UserProfile => ({
  id: data.id,
  bookingRef: data.booking_ref,
  firstName: data.first_name,
  lastName: data.last_name,
  eventId: data.event_id,
  roomNumber: data.room_number,
  roomType: data.room_type,
  checkIn: new Date(data.check_in_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' }),
  checkOut: new Date(data.check_out_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' }),
  currentTab: data.current_tab_amount || 0,
  whatsapp: data.whatsapp_number
});

const mapEvent = (data: any): EventConfig => ({
  id: data.id,
  name: data.name,
  theme: data.theme as EventTheme,
  location: data.location,
  coordinates: data.coordinates,
  // Mock weather as it's not in DB yet
  weather: { 
    temp: data.theme === 'silverstone' ? 19 : data.theme === 'monaco' ? 24 : 21, 
    wind: data.theme === 'silverstone' ? 12 : 5, 
    condition: data.theme === 'silverstone' ? 'Cloudy' : 'Sunny' 
  }
});

const mapSchedule = (data: any): ScheduleItem => ({
  id: data.id,
  time: data.start_time.substring(0, 5), // '12:30:00' -> '12:30'
  title: data.title,
  type: data.category,
  active: data.is_live
});

const mapProduct = (data: any): Product => ({
  id: data.id,
  name: data.name,
  price: data.price,
  brand: data.brand,
  image: data.image_url || 'bg-stone-200' // Fallback if null
});


// --- REAL SUPABASE SERVICE LAYER ---

const api = {
  auth: {
    signIn: async (bookingRef: string, firstName: string): Promise<UserProfile> => {
      const sb = getSupabase();
      if (!sb) throw new Error("Database configuration missing in index.tsx");

      // Query profiles table
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('booking_ref', bookingRef)
        .ilike('first_name', firstName) // Case insensitive
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials or connection error');
      }
      
      return mapProfile(data);
    }
  },
  events: {
    get: async (id: string): Promise<EventConfig> => {
      const sb = getSupabase();
      if (!sb) throw new Error("Database configuration missing in index.tsx");

      const { data, error } = await sb
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return mapEvent(data);
    },
    getSchedule: async (eventId: string): Promise<ScheduleItem[]> => {
      const sb = getSupabase();
      if (!sb) throw new Error("Database configuration missing in index.tsx");

      const { data, error } = await sb
        .from('schedule_items')
        .select('*')
        .eq('event_id', eventId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data.map(mapSchedule);
    }
  },
  shop: {
    getProducts: async (eventId: string): Promise<Product[]> => {
      const sb = getSupabase();
      if (!sb) throw new Error("Database configuration missing in index.tsx");

      const { data, error } = await sb
        .from('products')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return data.map(mapProduct);
    }
  }
};

// --- CUSTOM HOOKS ---

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true); 

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// "Next.js-lite" Router for client-side navigation
const useCustomRouter = () => {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('tab') || 'home' 
      : 'home'
  );

  useEffect(() => {
    const handlePopState = () => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      setCurrentPath(tab || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
    setCurrentPath(tab);
  };

  return { currentPath, navigate };
};

// --- THEME ENGINE ---

const getThemeClasses = (theme: EventTheme) => {
  switch (theme) {
    case 'silverstone':
      return {
        fontHeading: 'font-space-grotesk',
        fontBody: 'font-space-mono',
        bg: 'bg-grid-pattern',
        accentText: 'text-red-600',
        accentBg: 'bg-red-600',
        loadingBar: 'bg-red-600',
        cardShape: 'rounded-none',
        buttonShape: 'rounded-none',
        navStyle: 'border-t-2 border-red-600',
        tagline: 'Precision. Pace. Passion.',
        dock: 'rounded-none border-t border-stone-200'
      };
    case 'monaco':
      return {
        fontHeading: 'font-playfair italic',
        fontBody: 'font-lato',
        bg: 'bg-stone-50', 
        accentText: 'text-amber-600',
        accentBg: 'bg-stone-900',
        loadingBar: 'bg-amber-600',
        cardShape: 'rounded-sm',
        buttonShape: 'rounded-sm',
        navStyle: 'border-b-4 border-double border-amber-200',
        tagline: 'Elegance at Full Speed.',
        dock: 'rounded-2xl border border-stone-200 shadow-xl'
      };
    case 'glastonbury':
      return {
        fontHeading: 'font-fredoka',
        fontBody: 'font-quicksand',
        bg: 'wavy-bg',
        accentText: 'text-pink-500',
        accentBg: 'bg-gradient-to-r from-pink-400 to-orange-400',
        loadingBar: 'bg-pink-500',
        cardShape: 'rounded-3xl',
        buttonShape: 'rounded-full',
        navStyle: 'border-b border-pink-100',
        tagline: 'Field of Dreams.',
        dock: 'rounded-full border border-white/50 shadow-lg backdrop-blur-xl'
      };
  }
};

// --- SHARED COMPONENTS ---

const LoadingScreen = ({ theme }: { theme?: any }) => (
  <div className="flex flex-col items-center justify-center h-64 w-full">
     <Loader2 className={`animate-spin mb-4 ${theme ? theme.accentText : 'text-stone-400'}`} size={32} />
     <p className="text-xs font-mono text-stone-400 uppercase tracking-widest animate-pulse">Synchronizing...</p>
  </div>
);

const OfflineBanner = () => (
  <div className="bg-stone-800 text-stone-300 text-[10px] uppercase font-bold tracking-widest py-2 text-center flex items-center justify-center gap-2 animate-slide-down sticky top-0 z-[60]">
    <WifiOff size={12} />
    Offline Mode • Cached
  </div>
);

// --- PAGE COMPONENTS (Simulating Next.js `app/page.tsx` structure) ---

const HomePage = ({ theme, user, eventData, schedule }: any) => (
  <>
    {/* Welcome */}
    <section className="animate-slide-up">
      <h2 className={`text-3xl ${theme.fontHeading} mb-1`}>Good Morning, <span className="opacity-50 italic">{user.firstName}.</span></h2>
      <div className={`flex items-center gap-2 text-stone-500 text-xs`}>
          <MapPin size={12} /> {eventData.location}
      </div>
    </section>

    {/* Weather Widgets */}
    <section className="grid grid-cols-2 gap-3 animate-slide-up" style={{animationDelay: '100ms'}}>
        <div className={`bg-white p-4 border border-stone-200 ${theme.cardShape} flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow`}>
          <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
            <CloudSun size={60} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-stone-400">Air Temp</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl ${theme.fontHeading}`}>{eventData.weather.temp}°</span>
            <span className="text-xs text-stone-400">C</span>
          </div>
          <div className={`text-xs ${theme.accentText} font-medium`}>{eventData.weather.condition}</div>
        </div>
        
        <div className={`bg-white p-4 border border-stone-200 ${theme.cardShape} flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow`}>
          <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${theme.accentText}`}>
            <Wind size={60} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-stone-400">Wind</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl ${theme.fontHeading}`}>{eventData.weather.wind}</span>
            <span className="text-xs text-stone-400">km/h</span>
          </div>
          <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden mt-2">
            <div className={`h-full w-2/3 ${theme.accentBg}`}></div>
          </div>
        </div>
    </section>

    {/* Map Placeholder */}
    <section className={`h-48 bg-stone-900 ${theme.cardShape} relative overflow-hidden group shadow-lg animate-slide-up`} style={{animationDelay: '200ms'}}>
        {/* Abstract Map Graphic */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full stroke-stone-600 fill-none" strokeWidth="1">
          <path d="M20,50 Q50,10 80,50 T150,50 T200,80" />
          <path d="M0,80 Q50,80 80,20 T180,20" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className={`bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 ${theme.buttonShape} flex items-center gap-2 text-sm hover:bg-white/20 transition hover:scale-105 active:scale-95`}>
            <Map size={16} /> Open Site Map
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <div className={`w-3 h-3 ${theme.accentBg} rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]`}></div>
        </div>
    </section>

    {/* Timeline */}
    <section className="animate-slide-up" style={{animationDelay: '300ms'}}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg ${theme.fontHeading}`}>Today's Agenda</h3>
        <span className="text-xs font-mono border border-stone-200 px-2 py-1 rounded text-stone-400 bg-white/50">{new Date().toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric'})}</span>
      </div>
      <div className={`space-y-4 pl-4 border-l-2 border-stone-200`}>
        {schedule.length === 0 ? (
          <p className="text-xs text-stone-400 italic">No scheduled events for today.</p>
        ) : (
          schedule.map((item: any, idx: number) => (
            <div key={item.id} className={`relative transition-opacity duration-300 ${!item.active ? 'opacity-50 hover:opacity-80' : ''}`}>
              <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${item.active ? theme.accentBg : 'bg-stone-300'}`}></div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${item.active ? theme.accentText : 'text-stone-400'}`}>{item.time}</span>
                  {item.active && <span className={`text-[10px] uppercase ${theme.accentBg} text-white px-1.5 rounded animate-pulse`}>Live</span>}
                </div>
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-xs text-stone-500">{item.type}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  </>
);

const ShopPage = ({ theme, products }: any) => (
  <>
    <section className="text-center space-y-2 mb-8 animate-slide-up">
      <h2 className={`text-3xl ${theme.fontHeading}`}>Curated Store</h2>
      <p className="text-sm text-stone-500">Exclusive merchandise from our partners.</p>
    </section>

    {/* Sponsors */}
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-4 animate-slide-up" style={{animationDelay: '100ms'}}>
      {['Rolex', 'Pirelli', 'Moët & Chandon'].map((sponsor, i) => (
          <div key={i} className={`flex-shrink-0 h-10 px-6 border border-stone-200 bg-white flex items-center justify-center text-xs font-serif italic text-stone-400 ${theme.cardShape} hover:border-stone-400 transition-colors cursor-default`}>
            {sponsor}
          </div>
      ))}
    </div>

    {/* Products Grid */}
    <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{animationDelay: '200ms'}}>
      {products.length === 0 ? (
         <div className="col-span-2 text-center text-stone-400 text-xs py-12">Store inventory updating...</div>
      ) : (
        products.map((product: any) => (
          <div key={product.id} className={`bg-white border border-stone-200 overflow-hidden group ${theme.cardShape} hover:shadow-lg transition-all duration-300`}>
            <div className={`aspect-square ${product.image.startsWith('http') ? '' : product.image} relative flex items-center justify-center bg-stone-100`}>
              {product.image.startsWith('http') ? (
                 <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
              ) : (
                 <ShoppingBag className="text-stone-400 opacity-50 transition-transform duration-500 group-hover:scale-110" />
              )}
              <div className="absolute top-2 right-2 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded-sm">NEW</div>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">{product.brand}</p>
              <h4 className={`text-sm font-medium leading-tight my-1 ${theme.fontHeading}`}>{product.name}</h4>
              <div className="flex items-center justify-between mt-3">
                <span className={`font-mono text-xs`}>£{product.price}</span>
                <button className={`p-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white transition-colors ${theme.buttonShape}`}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </>
);

const PersonalPage = ({ theme, user }: any) => (
  <>
    {/* Digital Key Card */}
    <div className={`bg-stone-900 text-stone-50 p-6 relative overflow-hidden shadow-xl ${theme.cardShape} animate-flip-in`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <div className="w-32 h-32 border-4 border-white rounded-full"></div>
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest">Sanctuary</span>
            <h3 className={`text-3xl mt-1 ${theme.fontHeading}`}>{user.roomNumber}</h3>
            <p className="text-stone-400 text-xs">{user.roomType}</p>
          </div>
          <div className="text-right">
              <Flag size={20} className="text-stone-600 mb-2 ml-auto" />
          </div>
        </div>
        
        <div className="flex justify-between items-end border-t border-stone-700 pt-4">
            <div>
              <span className="text-[10px] text-stone-500 uppercase block">Check In</span>
              <span className="text-sm font-mono">{user.checkIn}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase block">Check Out</span>
              <span className="text-sm font-mono">{user.checkOut}</span>
            </div>
        </div>
      </div>
    </div>

    {/* Tab Status */}
    <div className={`bg-white p-4 border border-stone-200 flex items-center justify-between ${theme.cardShape} animate-slide-up`} style={{animationDelay: '100ms'}}>
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-stone-100 rounded-full text-stone-600`}>
          <CreditCard size={20} />
        </div>
        <div>
          <span className="text-xs font-bold block">Current Tab</span>
          <span className={`text-[10px] ${theme.accentText}`}>Unpaid</span>
        </div>
      </div>
      <span className={`text-xl font-mono`}>£{user.currentTab.toFixed(2)}</span>
    </div>

    {/* Services */}
    <section className="space-y-3 animate-slide-up" style={{animationDelay: '200ms'}}>
      <h3 className={`text-lg ${theme.fontHeading}`}>Concierge Services</h3>
      <button className={`w-full bg-white p-4 border border-stone-200 text-left hover:bg-stone-50 transition-colors flex items-center justify-between ${theme.cardShape}`}>
        <div className="flex items-center gap-3">
          <Coffee className="text-stone-400" size={18} />
          <span className="text-sm">Room Service Breakfast</span>
        </div>
        <ChevronRight size={16} className="text-stone-300" />
      </button>
      <button className={`w-full bg-white p-4 border border-stone-200 text-left hover:bg-stone-50 transition-colors flex items-center justify-between ${theme.cardShape}`}>
        <div className="flex items-center gap-3">
          <Wind className="text-stone-400" size={18} />
          <span className="text-sm">Spa & Wellness</span>
        </div>
        <ChevronRight size={16} className="text-stone-300" />
      </button>
    </section>
  </>
);

const SettingsPage = ({ theme, user, onLogout }: any) => (
  <div className="space-y-6 animate-slide-up">
    <h2 className={`text-3xl ${theme.fontHeading}`}>Preferences</h2>
    
    <section className={`bg-white p-6 border border-stone-200 space-y-6 ${theme.cardShape}`}>
      
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-400">WhatsApp Notification Number</label>
        <div className="flex gap-2">
            <select className="bg-stone-50 border border-stone-200 p-2 rounded text-sm text-stone-600">
              <option>+44</option>
              <option>+33</option>
              <option>+1</option>
            </select>
            <input type="tel" placeholder="7700 900000" className="flex-1 bg-stone-50 border border-stone-200 p-2 rounded text-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400" defaultValue={user.whatsapp} />
        </div>
        <p className="text-[10px] text-stone-400">We will send booking confirmations and urgent weather alerts here.</p>
      </div>

      <div className="border-t border-stone-100 pt-4 space-y-4">
        <div className="flex items-center justify-between">
            <span className="text-sm">Event Updates</span>
            <ToggleRight size={24} className={`${theme.accentText} cursor-pointer`} />
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm">Partner Offers</span>
            <ToggleLeft size={24} className="text-stone-300 cursor-pointer" />
        </div>
      </div>

    </section>

    <button 
      onClick={onLogout}
      className={`w-full border border-stone-300 text-stone-500 py-3 hover:bg-stone-100 hover:text-red-500 transition-colors flex items-center justify-center gap-2 text-sm ${theme.buttonShape}`}
    >
      <LogOut size={16} /> Sign Out
    </button>
  </div>
);

const Login = ({ onLogin }: { onLogin: (bookingRef: string, firstName: string) => void }) => {
  const [booking, setBooking] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOnline = useNetworkStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      setError('Connection lost. Please try again when online.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      await onLogin(booking, name);
    } catch (err) {
      console.error(err);
      setError('Booking reference invalid or not found.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#FDFCF8]">
      <div className="absolute inset-0 bg-[radial-gradient(#E7E5E4_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />
      
      {!isOnline && <OfflineBanner />}

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-stone-900 mx-auto rounded-full flex items-center justify-center mb-4 shadow-xl shadow-stone-200">
             <span className="text-stone-50 font-serif font-bold text-2xl italic">TPH</span>
          </div>
          <h1 className="text-3xl font-serif text-stone-900 tracking-tight">The Pop Up Hotel</h1>
          <p className="text-stone-500 font-sans text-sm">Sanctuary at the heart of the action.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-stone-200 shadow-lg">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Booking Reference</label>
            <input 
              type="text" 
              value={booking}
              onChange={(e) => setBooking(e.target.value)}
              placeholder="e.g. TPH-SIL-001"
              disabled={isSubmitting}
              className="w-full bg-stone-50 border border-stone-200 rounded p-3 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">First Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lewis"
              disabled={isSubmitting}
              className="w-full bg-stone-50 border border-stone-200 rounded p-3 text-stone-900 font-sans focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 disabled:opacity-50"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1"><Flag size={10}/> {error}</p>}

          <button 
            type="submit" 
            disabled={isSubmitting || !isOnline}
            className="w-full bg-stone-900 text-white font-medium py-3 rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:bg-stone-400"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <>Enter Sanctuary <ChevronRight size={16} /></>}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">Sample Logins (Must exist in DB)</p>
          <div className="flex justify-center gap-2 text-[10px] text-stone-500 font-mono">
            <button className="hover:text-stone-900 hover:underline" onClick={() => {setBooking('TPH-SIL-001'); setName('Lewis')}}>SIL-001</button> •
            <button className="hover:text-stone-900 hover:underline" onClick={() => {setBooking('TPH-MON-001'); setName('Charles')}}>MON-001</button> •
            <button className="hover:text-stone-900 hover:underline" onClick={() => {setBooking('TPH-GLA-001'); setName('Dua')}}>GLA-001</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }: { user: UserProfile, onLogout: () => void }) => {
  const { currentPath, navigate } = useCustomRouter();
  
  const [eventData, setEventData] = useState<EventConfig | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useNetworkStatus();

  // Initial Data Load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const evt = await api.events.get(user.eventId);
        setEventData(evt);
        
        // Supabase Query for Schedule by Event ID
        const sch = await api.events.getSchedule(user.eventId);
        setSchedule(sch);
        
        // Supabase Query for Products by Event ID
        const prod = await api.shop.getProducts(user.eventId);
        setProducts(prod);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.eventId]);

  if (!eventData || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
         <LoadingScreen />
      </div>
    );
  }

  const theme = getThemeClasses(eventData.theme);

  return (
    <div className={`min-h-screen text-stone-800 pb-24 ${theme.bg} ${theme.fontBody} transition-colors duration-500`}>
      
      {!isOnline && <OfflineBanner />}

      {/* HEADER */}
      <nav className={`fixed ${isOnline ? 'top-0' : 'top-8'} left-0 right-0 z-50 glass px-6 py-4 flex items-center justify-between ${theme.navStyle} transition-all duration-300`}>
        <div>
          <h1 className={`text-xl font-bold leading-none ${theme.fontHeading} transition-all`}>{eventData.name}</h1>
          <p className={`text-[10px] uppercase tracking-widest text-stone-500 mt-1 ${theme.fontBody}`}>{theme.tagline}</p>
        </div>
        <div className="flex gap-4">
          <button className="relative group">
            <Bell size={20} className="text-stone-600 transition-transform group-hover:rotate-12" />
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${theme.accentBg}`}></span>
          </button>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 max-w-md mx-auto space-y-8 animate-fade-in">
        
        {currentPath === 'home' && (
          <HomePage theme={theme} user={user} eventData={eventData} schedule={schedule} />
        )}

        {currentPath === 'shop' && (
          <ShopPage theme={theme} products={products} />
        )}

        {currentPath === 'personal' && (
          <PersonalPage theme={theme} user={user} />
        )}

        {currentPath === 'settings' && (
          <SettingsPage theme={theme} user={user} onLogout={onLogout} />
        )}

      </main>

      {/* BOTTOM DOCK */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`bg-white/90 backdrop-blur-lg px-6 py-3 flex items-center gap-8 ${theme.dock}`}>
          <button 
            onClick={() => navigate('home')}
            className={`flex flex-col items-center gap-1 group transition-all ${currentPath === 'home' ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-100'}`}
          >
            <Home size={20} className={`${currentPath === 'home' ? theme.accentText : 'text-stone-900'}`} strokeWidth={currentPath === 'home' ? 2.5 : 2} />
          </button>
          
          <button 
            onClick={() => navigate('shop')}
            className={`flex flex-col items-center gap-1 group transition-all ${currentPath === 'shop' ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-100'}`}
          >
            <ShoppingBag size={20} className={`${currentPath === 'shop' ? theme.accentText : 'text-stone-900'}`} strokeWidth={currentPath === 'shop' ? 2.5 : 2} />
          </button>
          
          <button 
            onClick={() => navigate('personal')}
            className={`flex flex-col items-center gap-1 group transition-all ${currentPath === 'personal' ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-100'}`}
          >
            <User size={20} className={`${currentPath === 'personal' ? theme.accentText : 'text-stone-900'}`} strokeWidth={currentPath === 'personal' ? 2.5 : 2} />
          </button>
          
          <button 
            onClick={() => navigate('settings')}
            className={`flex flex-col items-center gap-1 group transition-all ${currentPath === 'settings' ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-100'}`}
          >
            <Settings size={20} className={`${currentPath === 'settings' ? theme.accentText : 'text-stone-900'}`} strokeWidth={currentPath === 'settings' ? 2.5 : 2} />
          </button>
        </div>
      </div>

    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const handleLogin = async (bookingRef: string, firstName: string) => {
    const profile = await api.auth.signIn(bookingRef, firstName);
    setUser(profile);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return user ? <Dashboard user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
