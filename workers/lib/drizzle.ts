import { drizzle } from 'drizzle-orm/d1';
import type { Env } from './types';
import * as schema from '../db/schema';

export function getDb(env: Env) {
  return drizzle(env.DB as any, { schema });
}

export type DbClient = ReturnType<typeof getDb>;
