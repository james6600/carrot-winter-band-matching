import { NextResponse } from 'next/server';
import { loadArtists } from '../../../../lib/artists';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = (url.searchParams.get('q') ?? '').trim();
  const artists = await loadArtists(query, 30);
  return NextResponse.json({ artists: artists.map(a => ({name:a.name,genres:a.genres,region:a.region,country:a.country,artistType:a.artistType})) });
}
