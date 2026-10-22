import { currentParticipant } from "../../lib/auth";
import { loadArtists, artistMetaMap, normalizeArtistName, type ArtistMeta } from "../../lib/artists";
import { pool, q } from "../../lib/db";
import { GENRES, PARTS } from "../../lib/constants";

export const dynamic = "force-dynamic";

type ParticipantRow = {
  id: string;
  nickname: string;
  parts_json?: unknown;
  genres_json?: unknown;
  artists_json?: unknown;
  share_profile?: boolean;
};

type Profile = { id:string; nickname:string; parts:string[]; genres:string[]; artists:string[] };
type CountRow = { key: string; n: number };

type Match = {
  profile: Profile;
  score: number;
  sharedArtists: string[];
  sharedGenres: string[];
  tasteGenres: string[];
  partLabel: string;
  title: string;
};

const pm = new Map<string, string>(PARTS as readonly (readonly [string, string])[]);
const gm = new Map<string, string>(GENRES as readonly (readonly [string, string])[]);

function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}

function toProfile(r: ParticipantRow): Profile {
  return { id:r.id, nickname:r.nickname, parts:stringArray(r.parts_json), genres:stringArray(r.genres_json), artists:stringArray(r.artists_json) };
}

function countValues(profiles: Profile[], key: 'parts'|'genres'|'artists'): CountRow[] {
  const counts = new Map<string, number>();
  for (const p of profiles) for (const value of new Set(p[key])) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].map(([key,n])=>({key,n})).sort((a,b)=>b.n-a.n || a.key.localeCompare(b.key));
}

function jaccard(a: string[], b: string[]) {
  const aa = new Set(a), bb = new Set(b);
  const inter = [...aa].filter(x=>bb.has(x)).length;
  const union = new Set([...aa,...bb]).size;
  return union ? inter/union : 0;
}

function artistGenres(artists: string[], meta: Map<string, ArtistMeta>) {
  return [...new Set(artists.flatMap(name => meta.get(normalizeArtistName(name))?.genres ?? []))];
}

function sharedRankScore(a: string[], b: string[]) {
  let raw = 0;
  const max = a.reduce((sum,_,i)=>sum + (10-i),0) || 1;
  for (let i=0;i<a.length;i++) {
    const name = normalizeArtistName(a[i]);
    const j = b.findIndex(x=>normalizeArtistName(x)===name);
    if (j >= 0) raw += Math.max(2, 10-i) * Math.max(.35, 1-j*.07);
  }
  return Math.min(1, raw/max);
}

function tasteTitle(genres: string[]) {
  const top = genres[0];
  const label = gm.get(top) ?? top;
  if (!top) return '무대의 미지수';
  if (top.includes('rock') || top === 'alternative') return `${label} 탐험가`;
  if (top === 'jazz' || top === 'funk' || top === 'blues') return `${label} 그루브 메이커`;
  if (top === 'metal' || top === 'hardcore') return `${label} 화력 담당`;
  return `${label} 플레이리스트 수집가`;
}

function buildMatch(me: Profile, other: Profile, meta: Map<string, ArtistMeta>): Match {
  const sharedArtists = me.artists.filter(a=>other.artists.some(b=>normalizeArtistName(a)===normalizeArtistName(b)));
  const sharedGenres = me.genres.filter(g=>other.genres.includes(g));
  const myArtistGenres = artistGenres(me.artists, meta);
  const otherArtistGenres = artistGenres(other.artists, meta);
  const tasteGenres = [...new Set([...sharedGenres, ...myArtistGenres.filter(g=>otherArtistGenres.includes(g))])];
  const artistScore = sharedRankScore(me.artists, other.artists) * 52;
  const artistGenreScore = jaccard(myArtistGenres, otherArtistGenres) * 20;
  const explicitGenreScore = jaccard(me.genres, other.genres) * 18;
  const overlapParts = me.parts.filter(x=>other.parts.includes(x));
  const partScore = me.parts.length && other.parts.length ? (overlapParts.length ? 4 : 10) : 5;
  const score = Math.round(Math.min(100, artistScore + artistGenreScore + explicitGenreScore + partScore));
  const partLabel = overlapParts.length ? `${overlapParts.map(x=>pm.get(x)??x).join(' · ')}도 가능` : `${other.parts.map(x=>pm.get(x)??x).join(' · ') || '파트 미정'}`;
  return { profile:other, score, sharedArtists, sharedGenres, tasteGenres, partLabel, title:tasteTitle([...tasteGenres, ...otherArtistGenres, ...other.genres]) };
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const meSession = await currentParticipant();
  const rows = (await pool.query(
    `SELECT id::text,nickname,parts_json,genres_json,artists_json,share_profile
     FROM ${q("participants")}
     WHERE completed=true AND merged_into IS NULL
     ORDER BY created_at ASC`,
  )).rows as ParticipantRow[];
  const profiles = rows.filter(r=>r.share_profile !== false || r.id === meSession?.id).map(toProfile);
  const total = profiles.length;
  const partRows = countValues(profiles,'parts');
  const genreRows = countValues(profiles,'genres');
  const artistRows = countValues(profiles,'artists');
  const maxPart = Math.max(1, ...partRows.map(r=>r.n));
  const maxGenre = Math.max(1, ...genreRows.map(r=>r.n));
  const maxArtist = Math.max(1, ...artistRows.map(r=>r.n));

  const artistCatalog = await loadArtists('', 2000);
  const meta = artistMetaMap(artistCatalog);
  const me = meSession ? profiles.find(p=>p.id===meSession.id) : undefined;
  const matches = me ? profiles.filter(p=>p.id!==me.id).map(p=>buildMatch(me,p,meta)).sort((a,b)=>b.score-a.score).slice(0,8) : [];

  const selectedPart = typeof params.part === 'string' ? params.part : undefined;
  const selectedGenre = typeof params.genre === 'string' ? params.genre : undefined;
  const selectedArtist = typeof params.artist === 'string' ? params.artist : undefined;
  const showAll = params.view === 'all';
  const detailProfiles = profiles.filter(p => {
    if (showAll) return true;
    if (selectedPart) return p.parts.includes(selectedPart);
    if (selectedGenre) return p.genres.includes(selectedGenre);
    if (selectedArtist) return p.artists.some(a=>normalizeArtistName(a)===normalizeArtistName(selectedArtist));
    return false;
  });
  const detailTitle = showAll ? '참여자 전체' : selectedPart ? `${pm.get(selectedPart) ?? selectedPart} 선택자` : selectedGenre ? `${gm.get(selectedGenre) ?? selectedGenre} 선택자` : selectedArtist ? `${selectedArtist} 좋아하는 사람` : '';

  return (
    <main className="content-page dashboard-page">
      <div className="page-heading dashboard-heading">
        <div className="season-badge"><span>✦</span> BAND ROOM STATS</div>
        <h1>우리 모임에는<br/><em>어떤 취향이 모였을까요?</em></h1>
        <p>숫자와 막대를 누르면 누가 그 취향을 골랐는지 바로 볼 수 있어요.</p>
      </div>
      {params.saved === "1" && <div className="notice success">취향을 저장했어요. 아티스트까지 반영해 비슷한 메이트를 계산했어요 ✦</div>}

      <section className="stats-hero">
        <a className="big-stat clickable-stat" href="?view=all#selection-detail"><small>참여 완료 · 눌러보기</small><strong>{total}</strong><span>명</span></a>
        <div className="stats-copy"><span>THIS WINTER</span><h2>{total > 0 ? `${total}개의 취향이 한 무대에 모이고 있어요.` : "첫 번째 밴드 메이트를 기다리고 있어요."}</h2><a href="/onboarding">내 취향 수정하기 →</a></div>
      </section>

      {me && <section className="magic-card match-section">
        <div className="card-head"><div><small>YOUR BANDMATES</small><h2>{me.nickname}님과 취향이 가까운 메이트</h2><p>아티스트 52% + 아티스트 장르 20% + 직접 고른 장르 18% + 파트 조합 10%</p></div><span>🪄</span></div>
        {matches.length ? <div className="match-grid">{matches.map((m,idx)=><article className="match-card" key={m.profile.id}>
          <div className="match-rank">#{idx+1}</div><div className="match-score"><strong>{m.score}</strong><span>%</span></div>
          <h3>{m.profile.nickname}</h3><p className="match-title">{m.title}</p>
          <div className="match-reasons">
            {m.sharedArtists.length>0 && <span>🎧 같이 좋아함 · {m.sharedArtists.slice(0,3).join(' · ')}</span>}
            {m.tasteGenres.length>0 && <span>✦ 취향 결 · {m.tasteGenres.slice(0,3).map(g=>gm.get(g)??g).join(' · ')}</span>}
            <span>🎸 파트 · {m.partLabel}</span>
          </div>
        </article>)}</div> : <Empty label="다른 참여자가 취향을 저장하면 매칭 카드가 나타나요."/>}
      </section>}

      <div className="dashboard-grid">
        <section className="magic-card chart-card">
          <div className="card-head"><div><small>PARTS · CLICK</small><h2>어떤 파트가 모였나요?</h2></div><span>🎸</span></div>
          <div className="bar-list">
            {partRows.length ? partRows.map(r => <a className="bar-row clickable-row" key={r.key} href={`?part=${encodeURIComponent(r.key)}#selection-detail`}><div className="bar-label"><b>{pm.get(r.key) ?? r.key}</b><span>{r.n}명 →</span></div><div className="bar-track"><i style={{width:`${Math.max(8,r.n/maxPart*100)}%`}}/></div></a>) : <Empty label="아직 파트 데이터가 없어요."/>}
          </div>
        </section>
        <section className="magic-card chart-card">
          <div className="card-head"><div><small>GENRES · CLICK</small><h2>우리의 플레이리스트</h2></div><span>🎧</span></div>
          <div className="bar-list">
            {genreRows.length ? genreRows.slice(0,10).map(r => <a className="bar-row clickable-row" key={r.key} href={`?genre=${encodeURIComponent(r.key)}#selection-detail`}><div className="bar-label"><b>{gm.get(r.key) ?? r.key}</b><span>{r.n}명 →</span></div><div className="bar-track wine"><i style={{width:`${Math.max(8,r.n/maxGenre*100)}%`}}/></div></a>) : <Empty label="아직 장르 데이터가 없어요."/>}
          </div>
        </section>
      </div>

      <section className="magic-card chart-card artist-chart-card">
        <div className="card-head"><div><small>ARTISTS · CLICK</small><h2>가장 많이 겹친 아티스트</h2><p>선택 순서는 매칭 점수에서 가중치로 사용돼요.</p></div><span>🎙️</span></div>
        <div className="artist-bar-grid">
          {artistRows.length ? artistRows.slice(0,12).map(r => <a className="artist-stat-row" key={r.key} href={`?artist=${encodeURIComponent(r.key)}#selection-detail`}><div><b>{r.key}</b><span>{r.n}명</span></div><div className="bar-track gold"><i style={{width:`${Math.max(8,r.n/maxArtist*100)}%`}}/></div></a>) : <Empty label="취향 등록에서 좋아하는 아티스트를 골라주세요."/>}
        </div>
      </section>

      {(detailTitle || detailProfiles.length>0) && <section className="magic-card selection-detail" id="selection-detail">
        <div className="card-head"><div><small>WHO PICKED THIS?</small><h2>{detailTitle}</h2><p>{detailProfiles.length}명이 선택했어요.</p></div><a className="button small ghost" href="/dashboard">닫기</a></div>
        <div className="people-grid">{detailProfiles.map(p=><article className="person-card" key={p.id}>
          <div className="person-avatar">🥕</div><div><h3>{p.nickname}</h3><p>{p.parts.map(x=>pm.get(x)??x).join(' · ') || '파트 미정'}</p></div>
          <div className="person-tags">{p.artists.slice(0,3).map(a=><span key={a}>{a}</span>)}{p.genres.slice(0,3).map(g=><span key={g}>{gm.get(g)??g}</span>)}</div>
        </article>)}</div>
      </section>}

      {!me && <section className="coming-card"><span>✦</span><div><b>내 매칭 점수를 보고 싶다면</b><p>닉네임으로 입장하고 파트·장르·아티스트를 저장하면 아티스트 메타데이터까지 반영한 매칭 카드가 나타납니다.</p></div><a href="/onboarding">취향 등록 →</a></section>}
    </main>
  );
}

function Empty({label}:{label:string}) { return <div className="empty-state"><span>☾</span><p>{label}</p></div>; }
