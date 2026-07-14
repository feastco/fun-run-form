import { NextRequest, NextResponse } from 'next/server'
import { registrationSchema } from '@/lib/validations/registration'
import { registerParticipant } from '@/services/registration.service'
import { ApiResponse, ApiErrorResponse } from '@/types/api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Validate inputs via Zod
    const validation = registrationSchema.safeParse(body)
    if (!validation.success) {
      const fieldErrors = validation.error.errors.map((err) => ({
        field: String(err.path[0]),
        message: err.message,
      }))

      const errorResponse: ApiErrorResponse = {
        status: 'error',
        code: 400,
        message: 'Validasi pendaftaran gagal.',
        errors: fieldErrors,
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // 2. Perform registration + Midtrans Snap Token request
    const result = await registerParticipant(validation.data)

    const response: ApiResponse<typeof result> = {
      status: 'success',
      data: result,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: unknown) {
    console.error('API POST /registrations error:', error)
    
    const err = error as Record<string, unknown>
    const status = typeof err.code === 'number' ? err.code : 500
    const message = typeof err.message === 'string' ? err.message : 'Terjadi kesalahan saat memproses pendaftaran.'

    const errorResponse: ApiErrorResponse = {
      status: 'error',
      code: status,
      message,
    }
    return NextResponse.json(errorResponse, { status })
  }
}
