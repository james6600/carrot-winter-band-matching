import { pool, q } from './db';

export type ArtistMeta = {
  id: string;
  name: string;
  normalizedName: string;
  genres: string[];
  region?: string;
  country?: string;
  artistType?: string;
};

const starter: Omit<ArtistMeta, 'id' | 'normalizedName'>[] = [
  {name:'Oasis',genres:['british-rock','alternative','pop-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Blur',genres:['british-rock','alternative','indie-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Radiohead',genres:['alternative','indie-rock','modern-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'The Beatles',genres:['classic-rock','pop-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Queen',genres:['classic-rock','hard-rock','pop-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Arctic Monkeys',genres:['indie-rock','alternative','modern-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'The 1975',genres:['indie-rock','pop-rock','alternative'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Muse',genres:['alternative','modern-rock','hard-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Coldplay',genres:['pop-rock','alternative','modern-rock'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Green Day',genres:['punk-rock','pop-punk'],region:'North America',country:'US',artistType:'band'},
  {name:'My Chemical Romance',genres:['emo','pop-punk','alternative'],region:'North America',country:'US',artistType:'band'},
  {name:'Paramore',genres:['pop-punk','alternative','pop-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Foo Fighters',genres:['alternative','hard-rock','modern-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Nirvana',genres:['alternative','modern-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Red Hot Chili Peppers',genres:['alternative','funk','modern-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Linkin Park',genres:['alternative','hard-rock','metal'],region:'North America',country:'US',artistType:'band'},
  {name:'Metallica',genres:['metal','hard-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'The Strokes',genres:['indie-rock','alternative','modern-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Vampire Weekend',genres:['indie-rock','alternative'],region:'North America',country:'US',artistType:'band'},
  {name:'Tame Impala',genres:['indie-rock','alternative','pop-rock'],region:'Oceania',country:'Australia',artistType:'project'},
  {name:'혁오',genres:['indie-rock','alternative'],region:'Asia',country:'KR',artistType:'band'},
  {name:'잔나비',genres:['indie-rock','pop-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'실리카겔',genres:['indie-rock','alternative','modern-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'검정치마',genres:['indie-rock','alternative'],region:'Asia',country:'KR',artistType:'solo'},
  {name:'새소년',genres:['indie-rock','alternative','modern-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'쏜애플',genres:['indie-rock','modern-rock','alternative'],region:'Asia',country:'KR',artistType:'band'},
  {name:'NELL',genres:['modern-rock','alternative'],region:'Asia',country:'KR',artistType:'band'},
  {name:'DAY6',genres:['pop-rock','modern-rock','k-pop'],region:'Asia',country:'KR',artistType:'band'},
  {name:'LUCY',genres:['pop-rock','modern-rock','k-pop'],region:'Asia',country:'KR',artistType:'band'},
  {name:'The Volunteers',genres:['indie-rock','alternative'],region:'Asia',country:'KR',artistType:'band'},
  {name:'터치드',genres:['hard-rock','modern-rock','indie-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'QWER',genres:['pop-rock','k-pop'],region:'Asia',country:'KR',artistType:'band'},
  {name:'아이유',genres:['k-pop','ballad','pop-rock'],region:'Asia',country:'KR',artistType:'solo'},
  {name:'AKMU',genres:['k-pop','pop-rock','ballad'],region:'Asia',country:'KR',artistType:'duo'},
  {name:'윤하',genres:['pop-rock','k-pop','ballad'],region:'Asia',country:'KR',artistType:'solo'},
  {name:'자우림',genres:['alternative','modern-rock','pop-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'크라잉넛',genres:['punk-rock','indie-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'노브레인',genres:['punk-rock','indie-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'국카스텐',genres:['alternative','hard-rock','modern-rock'],region:'Asia',country:'KR',artistType:'band'},
  {name:'FTISLAND',genres:['pop-rock','k-pop'],region:'Asia',country:'KR',artistType:'band'},
  {name:'CNBLUE',genres:['pop-rock','k-pop'],region:'Asia',country:'KR',artistType:'band'},
  {name:'Mrs. GREEN APPLE',genres:['j-pop','pop-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'Official HIGE DANdism',genres:['j-pop','pop-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'King Gnu',genres:['j-pop','alternative','modern-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'ONE OK ROCK',genres:['j-pop','hard-rock','pop-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'RADWIMPS',genres:['j-pop','alternative','pop-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'ASIAN KUNG-FU GENERATION',genres:['j-pop','alternative','indie-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'BUMP OF CHICKEN',genres:['j-pop','pop-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'ELLEGARDEN',genres:['pop-punk','punk-rock','j-pop'],region:'Asia',country:'JP',artistType:'band'},
  {name:'SCANDAL',genres:['j-pop','pop-rock'],region:'Asia',country:'JP',artistType:'band'},
  {name:'YOASOBI',genres:['j-pop','pop-rock'],region:'Asia',country:'JP',artistType:'duo'},
  {name:'Ado',genres:['j-pop','pop-rock'],region:'Asia',country:'JP',artistType:'solo'},
  {name:'Vaundy',genres:['j-pop','alternative','pop-rock'],region:'Asia',country:'JP',artistType:'solo'},
  {name:'Kenshi Yonezu',genres:['j-pop','alternative'],region:'Asia',country:'JP',artistType:'solo'},
  {name:'back number',genres:['j-pop','pop-rock','ballad'],region:'Asia',country:'JP',artistType:'band'},
  {name:"L'Arc-en-Ciel",genres:['j-pop','hard-rock','alternative'],region:'Asia',country:'JP',artistType:'band'},
  {name:'X JAPAN',genres:['metal','hard-rock','j-pop'],region:'Asia',country:'JP',artistType:'band'},
  {name:'CHON',genres:['modern-rock','jazz'],region:'North America',country:'US',artistType:'band'},
  {name:'Snarky Puppy',genres:['jazz','funk'],region:'North America',country:'US',artistType:'band'},
  {name:'Vulfpeck',genres:['funk','jazz'],region:'North America',country:'US',artistType:'band'},
  {name:'John Mayer',genres:['blues','pop-rock'],region:'North America',country:'US',artistType:'solo'},
  {name:'Eric Clapton',genres:['blues','classic-rock'],region:'Europe',country:'UK',artistType:'solo'},
  {name:'Stevie Ray Vaughan',genres:['blues','classic-rock'],region:'North America',country:'US',artistType:'solo'},
  {name:'Polyphia',genres:['modern-rock','metal'],region:'North America',country:'US',artistType:'band'},
  {name:'Bring Me The Horizon',genres:['metal','hardcore','alternative'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Fall Out Boy',genres:['pop-punk','emo','pop-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'blink-182',genres:['pop-punk','punk-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Sum 41',genres:['pop-punk','punk-rock','hard-rock'],region:'North America',country:'CA',artistType:'band'},
  {name:'Avril Lavigne',genres:['pop-punk','pop-rock'],region:'North America',country:'CA',artistType:'solo'},
  {name:'The Smashing Pumpkins',genres:['alternative','modern-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Weezer',genres:['alternative','pop-rock'],region:'North America',country:'US',artistType:'band'},
  {name:'Franz Ferdinand',genres:['indie-rock','alternative'],region:'Europe',country:'UK',artistType:'band'},
  {name:'Phoenix',genres:['indie-rock','pop-rock'],region:'Europe',country:'FR',artistType:'band'},
  {name:'Måneskin',genres:['hard-rock','pop-rock'],region:'Europe',country:'IT',artistType:'band'}
];

export function normalizeArtistName(v: string) {
  return v.trim().normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');
}

export const STARTER_ARTISTS: ArtistMeta[] = starter.map((a, i) => ({
  ...a,
  id: `starter-${i + 1}`,
  normalizedName: normalizeArtistName(a.name),
}));

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p.map(String) : []; } catch { return v ? [v] : []; }
  }
  return [];
}

function value(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
}

export async function loadArtists(search = '', limit = 250): Promise<ArtistMeta[]> {
  const fallback = STARTER_ARTISTS.filter(a => !search || a.normalizedName.includes(normalizeArtistName(search))).slice(0, limit);
  try {
    const exists = await pool.query(`select to_regclass($1) as artists, to_regclass($2) as artist_genres`, [q('artists'), q('artist_genres')]);
    if (!exists.rows[0]?.artists) return fallback;

    const needle = `%${normalizeArtistName(search)}%`;
    const base = await pool.query(
      `select to_jsonb(a) as row from ${q('artists')} a
       where $1 = '' or lower(coalesce(to_jsonb(a)->>'name','')) like $2
       order by coalesce(to_jsonb(a)->>'name','') asc
       limit $3`,
      [search, needle, limit],
    );
    const genreMap = new Map<string, string[]>();
    if (exists.rows[0]?.artist_genres) {
      const gr = await pool.query(`select artist_id::text as artist_id, genre_key::text as genre_key from ${q('artist_genres')}`);
      for (const r of gr.rows as {artist_id:string;genre_key:string}[]) {
        genreMap.set(r.artist_id, [...(genreMap.get(r.artist_id) ?? []), r.genre_key]);
      }
    }
    const fromDb: ArtistMeta[] = [];
    for (const item of base.rows as {row: Record<string, unknown>}[]) {
      const r = item.row ?? {};
      const name = String(value(r,'name','display_name','canonical_name') ?? '').trim();
      if (!name) continue;
      const id = String(value(r,'id','artist_id','slug') ?? name);
      const embeddedGenres = arr(value(r,'genres_json','genre_keys','genres'));
      fromDb.push({
        id,
        name,
        normalizedName: normalizeArtistName(String(value(r,'normalized_name') ?? name)),
        genres: [...new Set([...embeddedGenres, ...(genreMap.get(id) ?? [])])],
        region: String(value(r,'region') ?? '') || undefined,
        country: String(value(r,'country') ?? '') || undefined,
        artistType: String(value(r,'artist_type','type') ?? '') || undefined,
      });
    }
    const merged = new Map<string, ArtistMeta>();
    for (const a of [...fromDb, ...fallback]) if (!merged.has(a.normalizedName)) merged.set(a.normalizedName, a);
    return [...merged.values()].slice(0, limit);
  } catch (error) {
    console.error('artist catalog load failed, using starter catalog', error);
    return fallback;
  }
}

export function artistMetaMap(items: ArtistMeta[]) {
  return new Map(items.map(a => [normalizeArtistName(a.name), a]));
}
