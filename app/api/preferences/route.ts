import { NextResponse } from "next/server";
import { currentParticipant } from "../../../lib/auth";
import { pool, q } from "../../../lib/db";
import { PARTS, GENRES } from "../../../lib/constants";

const allowedParts = new Set<string>(PARTS.map((x: readonly [string, string]) => x[0]));
const allowedGenres = new Set<string>(GENRES.map((x: readonly [string, string]) => x[0]));

export async function POST(req: Request) {
  const me = await currentParticipant();
  if (!me) {
    return NextResponse.redirect(new URL("/onboarding?error=session", req.url), 303);
  }

  try {
    const f = await req.formData();
    const parts = f.getAll("parts").map(String).filter((x: string) => allowedParts.has(x));
    const genres = f.getAll("genres").map(String).filter((x: string) => allowedGenres.has(x));
    const artists = [...new Set(f.getAll("artists").map(String).map((x: string) => x.trim()).filter(Boolean))].slice(0, 10);

    await pool.query(
      `UPDATE ${q("participants")}
       SET parts_json=$1::jsonb,
           genres_json=$2::jsonb,
           artists_json=$3::jsonb,
           completed=true,
           updated_at=now()
       WHERE id=$4`,
      [JSON.stringify(parts), JSON.stringify(genres), JSON.stringify(artists), me.id],
    );

    return NextResponse.redirect(new URL("/dashboard?saved=1", req.url), 303);
  } catch (error) {
    console.error("preference save failed", error);
    return NextResponse.redirect(new URL("/onboarding?error=db", req.url), 303);
  }
}
