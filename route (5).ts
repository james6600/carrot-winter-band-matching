import { NextResponse } from "next/server";
import { newSalt, hashPassword, newToken, normalizeNickname, tokenHash } from "../../../../lib/auth";
import { pool, q } from "../../../../lib/db";

export async function POST(req: Request) {
  const f = await req.formData();
  const nickname = String(f.get("nickname") || "").trim();
  const password = String(f.get("password") || "");
  if (nickname.length < 2 || password.length < 8) return NextResponse.redirect(new URL("/onboarding?error=input", req.url), 303);
  try {
    const normalized = normalizeNickname(nickname);
    let participantId: string;
    const existing = await pool.query(`SELECT id,password_hash,password_salt FROM ${q("participants")} WHERE normalized_nickname=$1 AND merged_into IS NULL`, [normalized]);
    if (existing.rowCount) {
      const row = existing.rows[0];
      if (hashPassword(password, row.password_salt) !== row.password_hash) return NextResponse.redirect(new URL("/onboarding?error=password", req.url), 303);
      participantId = row.id;
    } else {
      const salt = newSalt();
      const r = await pool.query(`INSERT INTO ${q("participants")}(nickname,normalized_nickname,password_hash,password_salt) VALUES($1,$2,$3,$4) RETURNING id`, [nickname, normalized, hashPassword(password, salt), salt]);
      participantId = r.rows[0].id;
    }
    const token = newToken();
    await pool.query(`INSERT INTO ${q("participant_sessions")}(participant_id,token_hash,expires_at) VALUES($1,$2,now()+interval '30 days')`, [participantId, tokenHash(token)]);
    const res = NextResponse.redirect(new URL("/onboarding", req.url), 303);
    res.cookies.set("participant_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (error) {
    console.error("participant login failed", error);
    return NextResponse.redirect(new URL("/onboarding?error=db", req.url), 303);
  }
}
