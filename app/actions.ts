'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  mapProfile, 
  mapEvent, 
  mapSchedule, 
  mapProduct 
} from '@/lib/utils';
import { fetchWeatherForCoordinates } from '@/lib/weather';
import type { UserProfile, EventConfig, ScheduleItem, Product } from '@/types';

// Authentication Actions

export async function signIn(
  bookingRef: string, 
  firstName: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const supabase = await createClient();

    // Query profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('booking_ref', bookingRef)
      .ilike('first_name', firstName) // Case insensitive
      .single();

    if (error || !data) {
      return { 
        success: false, 
        error: 'Invalid credentials or connection error' 
      };
    }

    return { 
      success: true, 
      user: mapProfile(data) 
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: 'Database configuration missing or connection error' 
    };
  }
}

// Event Actions

export async function getEvent(eventId: string): Promise<EventConfig | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      console.error('Error fetching event:', error);
      return null;
    }

    const event = mapEvent(data);

    if (event.coordinates) {
      const liveWeather = await fetchWeatherForCoordinates(event.coordinates);
      if (liveWeather) {
        event.weather = liveWeather;
      }
    }

    return event;
  } catch (error) {
    console.error('Get event error:', error);
    return null;
  }
}

export async function getSchedule(eventId: string): Promise<ScheduleItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time', { ascending: true });

    if (error || !data) {
      console.error('Error fetching schedule:', error);
      return [];
    }

    return data.map(mapSchedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    return [];
  }
}

// Shop Actions

export async function getProducts(eventId: string): Promise<Product[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('event_id', eventId);

    if (error || !data) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data.map(mapProduct);
  } catch (error) {
    console.error('Get products error:', error);
    return [];
  }
}

// User Profile Actions

export async function updateWhatsApp(
  userId: string, 
  whatsappNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ whatsapp_number: whatsappNumber })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update WhatsApp error:', error);
    return { success: false, error: 'Failed to update WhatsApp number' };
  }
}
