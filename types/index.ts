// Type Definitions for Pop Up Hotel App

export type EventTheme = 'silverstone' | 'monaco' | 'glastonbury';

export interface EventConfig {
  id: string;
  name: string;
  theme: EventTheme;
  location: string;
  coordinates: string;
  weather: { temp: number; wind: number; condition: string };
}

export interface UserProfile {
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

export interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  type: string;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  brand: string;
  image: string;
}

// Database Types (snake_case from Supabase)
export interface DatabaseProfile {
  id: string;
  booking_ref: string;
  first_name: string;
  last_name: string;
  event_id: string;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  current_tab_amount?: number;
  whatsapp_number?: string;
}

export interface DatabaseEvent {
  id: string;
  name: string;
  theme: EventTheme;
  location: string;
  coordinates: string;
}

export interface DatabaseScheduleItem {
  id: number;
  event_id: string;
  title: string;
  category: string;
  start_time: string;
  is_live: boolean;
}

export interface DatabaseProduct {
  id: number;
  event_id: string;
  name: string;
  price: number;
  brand: string;
  image_url: string | null;
}

// Theme Configuration
export interface ThemeClasses {
  fontHeading: string;
  fontBody: string;
  bg: string;
  accentText: string;
  accentBg: string;
  loadingBar: string;
  cardShape: string;
  buttonShape: string;
  navStyle: string;
  tagline: string;
  dock: string;
}
