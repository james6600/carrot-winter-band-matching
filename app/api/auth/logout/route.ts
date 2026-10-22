import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tokenHash } from "../../../../lib/auth";
import { pool, q } from "../../../../lib/db";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get("participant_session")?.value;

  if (token) {
    try {
      await pool.query(`DELETE FROM ${q("sessions")} WHERE token_hash=$1`, [tokenHash(token)]);
    } catch (error) {
      console.error("participant logout session cleanup failed", error);
    }
  }

  const res = NextResponse.redirect(new URL("/onboarding", req.url), 303);
  res.cookies.delete("participant_session");
  return res;
}
