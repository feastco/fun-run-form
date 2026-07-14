import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: "Missing required env var: NEXT_PUBLIC_SUPABASE_URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, { message: "Missing required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY" }),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1, { message: "Missing required env var: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY" }),
  NEXT_PUBLIC_BASE_URL: z.string().url({ message: "Missing required env var: NEXT_PUBLIC_BASE_URL" }),
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
});

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: "Missing required env var: SUPABASE_SERVICE_ROLE_KEY" }),
  MIDTRANS_SERVER_KEY: z.string().min(1, { message: "Missing required env var: MIDTRANS_SERVER_KEY" }),
  MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"], {
    errorMap: () => ({ message: "Missing required env var: MIDTRANS_IS_PRODUCTION" }),
  }),
  SENTRY_AUTH_TOKEN: z.string().optional().or(z.literal("")),
});

const isServer = typeof window === "undefined";

let env: z.infer<typeof serverEnvSchema> | z.infer<typeof clientEnvSchema>;

if (isServer) {
  const result = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  });

  if (!result.success) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      env = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-build.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-build-anon-key',
        NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'placeholder-build-client-key',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        SENTRY_DSN: process.env.SENTRY_DSN || 'https://placeholder@sentry.io/1',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-build-service-key',
        MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || 'placeholder-build-server-key',
        MIDTRANS_IS_PRODUCTION: (process.env.MIDTRANS_IS_PRODUCTION as unknown as 'true' | 'false') || 'false',
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || 'placeholder-build-auth-token',
      };
    } else {
      throw new Error(result.error.errors[0].message);
    }
  } else {
    env = result.data;
  }
} else {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
  });

  if (!result.success) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      env = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-build.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-build-anon-key',
        NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'placeholder-build-client-key',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        SENTRY_DSN: process.env.SENTRY_DSN || 'https://placeholder@sentry.io/1',
      };
    } else {
      throw new Error(result.error.errors[0].message);
    }
  } else {
    env = result.data;
  }
}

export { env };
export type Env = typeof env;
