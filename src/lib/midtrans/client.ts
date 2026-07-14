import midtransClient from 'midtrans-client'
import { env } from '@/lib/env'

const serverEnv = env as Record<string, unknown>

export const snap = new midtransClient.Snap({
  isProduction: serverEnv.MIDTRANS_IS_PRODUCTION === 'true' || serverEnv.MIDTRANS_IS_PRODUCTION === true,
  serverKey: String(serverEnv.MIDTRANS_SERVER_KEY),
  clientKey: String(serverEnv.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY),
})
