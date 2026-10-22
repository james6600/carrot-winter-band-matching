import { Pool, PoolClient } from "pg";

const globalForDb = globalThis as unknown as { cwbmPool?: Pool };
let localPool: Pool | undefined = globalForDb.cwbmPool;

export const schema = "carrot_winter_band_matching";
export const q = (name: string) => `"${schema}"."${name}"`;

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL_MISSING");
  }
  if (!localPool) {
    localPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 8_000,
    });
    if (process.env.NODE_ENV !== "production") globalForDb.cwbmPool = localPool;
  }
  return localPool;
}

export const pool = {
  query: (...args: any[]) => (getPool().query as any)(...args),
  connect: () => getPool().connect(),
};

export async function tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
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

export async function databaseHealth() {
  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false, code: "DATABASE_URL_MISSING", message: "Vercel Production 환경변수 DATABASE_URL이 없습니다." };
  }
  try {
    const r = await getPool().query(
      `select count(*)::int as n from information_schema.tables where table_schema=$1 and table_type='BASE TABLE'`,
      [schema],
    );
    const count = Number(r.rows[0]?.n ?? 0);
    if (count < 13) return { ok: false, code: "SCHEMA_INCOMPLETE", message: `Supabase 스키마가 완성되지 않았습니다. 현재 ${count}/13 테이블입니다.`, tableCount: count };
    await getPool().query(`select 1 from ${q("participants")} limit 1`);
    return { ok: true, code: "OK", message: "Supabase 연결과 앱 스키마가 정상입니다.", tableCount: count };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, code: "DATABASE_CONNECTION_FAILED", message: "Supabase 데이터베이스에 연결하지 못했습니다.", detail: message };
  }
}
