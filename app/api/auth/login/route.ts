import { NextResponse } from "next/server";
import { newSalt, hashPassword, newToken, normalizeNickname, tokenHash } from "../../../../lib/auth";
import { pool, q } from "../../../../lib/db";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const f = await req.formData();
  const nickname = String(f.get("nickname") || "").trim();
  const password = String(f.get("password") || "");

  if (nickname.length < 2 || password.length < 8) {
    return NextResponse.redirect(new URL("/onboarding?error=input", req.url), 303);
  }

  try {
    const normalized = normalizeNickname(nickname);
    let participantId: string;

    const existing = await pool.query(
      `SELECT id,password_hash,password_salt
       FROM ${q("participants")}
       WHERE normalized_nickname=$1 AND merged_into IS NULL`,
      [normalized],
    );

    if (existing.rowCount) {
      const row = existing.rows[0];
      if (hashPassword(password, row.password_salt) !== row.password_hash) {
        return NextResponse.redirect(new URL("/onboarding?error=password", req.url), 303);
      }
      participantId = String(row.id);
    } else {
      const salt = newSalt();
      const created = await pool.query(
        `INSERT INTO ${q("participants")}
          (nickname,normalized_nickname,password_hash,password_salt)
         VALUES($1,$2,$3,$4)
         RETURNING id`,
        [nickname, normalized, hashPassword(password, salt), salt],
      );
      participantId = String(created.rows[0].id);
    }

    const token = newToken();
    const expiresAt = Date.now() + SESSION_TTL_MS;

    await pool.query(
      `INSERT INTO ${q("sessions")}(token_hash,participant_id,expires_at)
       VALUES($1,$2,$3)`,
      [tokenHash(token), participantId, expiresAt],
    );

    const res = NextResponse.redirect(new URL("/onboarding", req.url), 303);
    res.cookies.set("participant_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });
    return res;
  } catch (error) {
    console.error("participant login failed", error);
    return NextResponse.redirect(new URL("/onboarding?error=login-server", req.url), 303);
  }
}
