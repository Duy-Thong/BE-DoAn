import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default('info'),
  JWT_SECRET: z.string().min(10).default('change-me-in-.env'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:1234@localhost:5432/recruitment_system?schema=public'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

// Ensure Prisma can always read DATABASE_URL from process.env
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}

