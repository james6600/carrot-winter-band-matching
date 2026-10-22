import { Pool, PoolClient } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured");

const globalForDb = globalThis as unknown as { pool?: Pool };
export const pool = globalForDb.pool ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
});
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const schema = 'carrot_winter_band_matching';
export const q = (name: string) => `"${schema}"."${name}"`;

export async function tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
