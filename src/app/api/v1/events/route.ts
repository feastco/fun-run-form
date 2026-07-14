import { NextResponse } from 'next/server'
import { getActiveEvents } from '@/services/event.service'
import { ApiResponse, ApiErrorResponse } from '@/types/api'

export const dynamic = 'force-dynamic'

interface EventCategoryQuery {
  id: string
  name: string
  distance_km: number
  price: number
  quota: number
  reserved_count: number
  is_active: boolean
}

interface EventQuery {
  id: string
  name: string
  description: string | null
  event_date: string
  location: string
  registration_open_at: string
  registration_close_at: string
  is_active: boolean
  event_categories?: EventCategoryQuery[]
}

export async function GET() {
  try {
    const events = (await getActiveEvents()) as unknown as EventQuery[]

    const now = new Date()

    const formattedEvents = events.map((event) => {
      const openAt = new Date(event.registration_open_at)
      const closeAt = new Date(event.registration_close_at)
      const isRegistrationOpen = now >= openAt && now <= closeAt && event.is_active

      const categories = (event.event_categories || []).map((cat: EventCategoryQuery) => ({
        id: cat.id,
        name: cat.name,
        distance_km: Number(cat.distance_km),
        price: cat.price,
        quota: cat.quota,
        available_slots: Math.max(0, cat.quota - cat.reserved_count),
        is_active: cat.is_active,
      }))

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        event_date: event.event_date,
        location: event.location,
        registration_open_at: event.registration_open_at,
        registration_close_at: event.registration_close_at,
        is_registration_open: isRegistrationOpen,
        categories,
      }
    })

    const response: ApiResponse<typeof formattedEvents> = {
      status: 'success',
      data: formattedEvents,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API GET /events error:', error)
    const errorResponse: ApiErrorResponse = {
      status: 'error',
      code: 500,
      message: 'Gagal mengambil data event. Silakan coba beberapa saat lagi.',
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
