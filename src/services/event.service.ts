/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getActiveEvents(customClient?: SupabaseClient<Database>) {
  const supabase = customClient || (await createClient())

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      description,
      event_date,
      location,
      registration_open_at,
      registration_close_at,
      is_active,
      event_categories (
        id,
        name,
        distance_km,
        price,
        quota,
        reserved_count,
        is_active
      )
    `)
    .eq('is_active', true)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching active events:', error)
    throw error
  }

  return data
}

export async function getCategoryById(categoryId: string, customClient?: SupabaseClient<Database>) {
  const supabase = customClient || (await createClient())

  const { data, error } = await supabase
    .from('event_categories')
    .select(`
      id,
      event_id,
      name,
      distance_km,
      price,
      quota,
      reserved_count,
      is_active,
      events (
        id,
        name,
        description,
        event_date,
        location,
        registration_open_at,
        registration_close_at,
        is_active
      )
    `)
    .eq('id', categoryId)
    .single()

  if (error) {
    console.error('Error fetching category by id:', error)
    throw error
  }

  return data as any
}
