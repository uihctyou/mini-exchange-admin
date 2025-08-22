/**
 * Environment variables configuration with validation
 * Ensures type safety and provides defaults for development
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server configuration
  PORT: z.string().transform(Number).default('3000'),
  
  // Authentication mode
  AUTH_MODE: z.enum(['BFF', 'DIRECT']).default('BFF'),
  
  // Backend API configuration
  EXCHANGE_API_BASE_URL: z.string().url().default('http://localhost:8080'),
  
  // Cookie settings (for BFF mode)
  AUTH_COOKIE_NAME: z.string().default('access_token'),
  AUTH_COOKIE_SECURE: z.string().transform(Boolean).default('true'),
  AUTH_COOKIE_SAMESITE: z.enum(['Strict', 'Lax', 'None']).default('Strict'),
  AUTH_COOKIE_MAXAGE: z.string().transform(Number).default('900'), // 15 minutes
  
  // Internationalization
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('en'),
  NEXT_PUBLIC_SUPPORTED_LOCALES: z.string().default('en,zh-TW'),
  
  // App metadata
  NEXT_PUBLIC_APP_NAME: z.string().default('Mini Exchange Admin'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.1.0'),
  
  // Optional: Monitoring and analytics
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

// Parse and validate environment variables
function parseEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    AUTH_MODE: process.env.AUTH_MODE,
    EXCHANGE_API_BASE_URL: process.env.EXCHANGE_API_BASE_URL,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE,
    AUTH_COOKIE_SAMESITE: process.env.AUTH_COOKIE_SAMESITE,
    AUTH_COOKIE_MAXAGE: process.env.AUTH_COOKIE_MAXAGE,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPPORTED_LOCALES: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.errors.forEach((error) => {
      console.error(`  ${error.path}: ${error.message}`);
    });
    throw new Error('Invalid environment variables');
  }

  return result.data;
}

// Export the validated environment variables
export const env = parseEnv();

// Type for the environment configuration
export type Env = typeof env;

// Helper functions for environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Get supported locales as array
export const supportedLocales = env.NEXT_PUBLIC_SUPPORTED_LOCALES.split(',');

// API configuration
export const apiConfig = {
  baseUrl: env.EXCHANGE_API_BASE_URL,
  timeout: 10000, // 10 seconds
  retries: 3,
} as const;

// Cookie configuration
export const cookieConfig = {
  name: env.AUTH_COOKIE_NAME,
  secure: env.AUTH_COOKIE_SECURE,
  sameSite: env.AUTH_COOKIE_SAMESITE,
  maxAge: env.AUTH_COOKIE_MAXAGE,
  httpOnly: true,
  path: '/',
} as const;
