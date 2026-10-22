import crypto from "crypto";
import { cookies } from "next/headers";
import { pool, q } from "./db";

const ITERATIONS = 100_000;
export function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256").toString("hex");
}
export function newSalt() { return crypto.randomBytes(32).toString("hex"); }
export function newToken() { return crypto.randomBytes(32).toString("hex"); }
export function tokenHash(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }
export function normalizeNickname(v: string) { return v.trim().normalize("NFKC").toLowerCase().replace(/\s+/g, ""); }

export async function currentParticipant() {
  const jar = await cookies();
  const token = jar.get("participant_session")?.value;
  if (!token) return null;
  const r = await pool.query(`SELECT p.id,p.nickname FROM ${q("participant_sessions")} s JOIN ${q("participants")} p ON p.id=s.participant_id WHERE s.token_hash=$1 AND s.expires_at>now() AND p.merged_into IS NULL`, [tokenHash(token)]);
  return r.rows[0] ?? null;
}

export async function isAdmin() {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token) return false;
  const r = await pool.query(`SELECT 1 FROM ${q("admin_sessions")} WHERE token_hash=$1 AND expires_at>now()`, [tokenHash(token)]);
  return r.rowCount === 1;
}
