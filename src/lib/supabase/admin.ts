import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { Database } from '@/types/database'

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient must only be called on the server side')
  }

  // Cast env to any to avoid TypeScript complaints about server-only keys in client bundle interfaces,
  // falling back to direct process.env as safety.
  const envRecord = env as unknown as Record<string, string | undefined>;
  const serviceRoleKey = envRecord.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
