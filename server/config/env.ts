import { config } from 'dotenv';
import { z } from 'zod';
config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_URL: z.url().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('/api/v1'),
  MONGODB_URI: z.string().default(''),
  SESSION_SECRET: z.string().default('development-session-secret'),
  JWT_SECRET: z.string().default('development-jwt-secret'),
  AI_PROVIDER: z.string().default('demo'), AI_API_KEY: z.string().default(''), AI_MODEL: z.string().default('gpt-image-2'),
  CLOUDINARY_CLOUD_NAME: z.string().default(''), CLOUDINARY_API_KEY: z.string().default(''), CLOUDINARY_API_SECRET: z.string().default(''), WEATHER_API_KEY: z.string().default(''),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`);
export const env = parsed.data;
if (env.NODE_ENV === 'production') {
  const missing = ['MONGODB_URI', 'SESSION_SECRET', 'JWT_SECRET'].filter((key) => !env[key as keyof typeof env]);
  if (missing.length) throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
  if (env.SESSION_SECRET.length < 32 || env.JWT_SECRET.length < 32) throw new Error('Production session and JWT secrets must be at least 32 characters.');
}


