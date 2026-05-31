import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'gfos_db',
  user: process.env.DATABASE_USER || 'gfos',
  password: process.env.DATABASE_PASSWORD || 'gfos',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  return pool.end();
}
