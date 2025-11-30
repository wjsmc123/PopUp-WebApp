import type { 
  EventTheme, 
  ThemeClasses, 
  UserProfile, 
  EventConfig, 
  ScheduleItem, 
  Product,
  DatabaseProfile,
  DatabaseEvent,
  DatabaseScheduleItem,
  DatabaseProduct
} from '@/types';

// Theme Engine - Returns CSS classes based on event theme
export function getThemeClasses(theme: EventTheme): ThemeClasses {
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
}

// Data Mapping Helpers (DB Snake_case -> UI CamelCase)

export function mapProfile(data: DatabaseProfile): UserProfile {
  return {
    id: data.id,
    bookingRef: data.booking_ref,
    firstName: data.first_name,
    lastName: data.last_name,
    eventId: data.event_id,
    roomNumber: data.room_number,
    roomType: data.room_type,
    checkIn: new Date(data.check_in_date).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric' 
    }),
    checkOut: new Date(data.check_out_date).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric' 
    }),
    currentTab: data.current_tab_amount || 0,
    whatsapp: data.whatsapp_number
  };
}

export function mapEvent(data: DatabaseEvent): EventConfig {
  // Mock weather as it's not in DB yet
  const weatherMap = {
    silverstone: { temp: 19, wind: 12, condition: 'Cloudy' },
    monaco: { temp: 24, wind: 5, condition: 'Sunny' },
    glastonbury: { temp: 21, wind: 8, condition: 'Partly Cloudy' }
  };

  return {
    id: data.id,
    name: data.name,
    theme: data.theme as EventTheme,
    location: data.location,
    coordinates: data.coordinates,
    weather: weatherMap[data.theme] || { temp: 20, wind: 10, condition: 'Clear' }
  };
}

export function mapSchedule(data: DatabaseScheduleItem): ScheduleItem {
  return {
    id: data.id,
    time: data.start_time.substring(0, 5), // '12:30:00' -> '12:30'
    title: data.title,
    type: data.category,
    active: data.is_live
  };
}

export function mapProduct(data: DatabaseProduct): Product {
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    brand: data.brand,
    image: data.image_url || 'bg-stone-200' // Fallback if null
  };
}

// Utility function to combine class names
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
