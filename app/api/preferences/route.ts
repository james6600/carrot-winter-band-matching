import { NextResponse } from "next/server";
import { currentParticipant } from "../../../lib/auth";
import { q, tx } from "../../../lib/db";
import { PARTS, GENRES } from "../../../lib/constants";
const allowedParts = new Set<string>(PARTS.map((x: readonly [string, string]) => x[0]));
const allowedGenres = new Set<string>(GENRES.map((x: readonly [string, string]) => x[0]));
export async function POST(req: Request) {
  const me = await currentParticipant();
  if (!me) return NextResponse.redirect(new URL("/onboarding?error=session", req.url), 303);
  try {
    const f = await req.formData();
    const parts = f.getAll("parts").map(String).filter((x: string) => allowedParts.has(x));
    const genres = f.getAll("genres").map(String).filter((x: string) => allowedGenres.has(x));
    await tx(async c => {
      await c.query(`DELETE FROM ${q("participant_parts")} WHERE participant_id=$1`, [me.id]);
      await c.query(`DELETE FROM ${q("participant_genres")} WHERE participant_id=$1`, [me.id]);
      for (const x of parts) await c.query(`INSERT INTO ${q("participant_parts")}(participant_id,part_key) VALUES($1,$2) ON CONFLICT DO NOTHING`, [me.id, x]);
      for (const x of genres) await c.query(`INSERT INTO ${q("participant_genres")}(participant_id,genre_key) VALUES($1,$2) ON CONFLICT DO NOTHING`, [me.id, x]);
      await c.query(`UPDATE ${q("participants")} SET completed=true,updated_at=now() WHERE id=$1`, [me.id]);
    });
    return NextResponse.redirect(new URL("/dashboard?saved=1", req.url), 303);
  } catch (error) {
    console.error("preference save failed", error);
    return NextResponse.redirect(new URL("/onboarding?error=db", req.url), 303);
  }
}
