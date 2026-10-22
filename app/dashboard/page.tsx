import { pool, q } from "../../lib/db";
import { GENRES, PARTS } from "../../lib/constants";

export const dynamic = "force-dynamic";

type CountRow = { key: string; n: number | string };

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const total = (await pool.query(`SELECT count(*)::int n FROM ${q("participants")} WHERE completed=true AND merged_into IS NULL`)).rows[0]?.n ?? 0;

  const partRows = (await pool.query(
    `SELECT part_key AS key, count(*)::int AS n
     FROM ${q("participants")} p
     CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(p.parts_json, '[]'::jsonb)) AS part_key
     WHERE p.completed=true AND p.merged_into IS NULL
     GROUP BY part_key
     ORDER BY n DESC`,
  )).rows as CountRow[];

  const genreRows = (await pool.query(
    `SELECT genre_key AS key, count(*)::int AS n
     FROM ${q("participants")} p
     CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(p.genres_json, '[]'::jsonb)) AS genre_key
     WHERE p.completed=true AND p.merged_into IS NULL
     GROUP BY genre_key
     ORDER BY n DESC`,
  )).rows as CountRow[];

  const pm = new Map<string, string>(PARTS as readonly (readonly [string, string])[]);
  const gm = new Map<string, string>(GENRES as readonly (readonly [string, string])[]);
  const maxPart = Math.max(1, ...partRows.map((r) => Number(r.n)));
  const maxGenre = Math.max(1, ...genreRows.map((r) => Number(r.n)));

  return (
    <main className="content-page dashboard-page">
      <div className="page-heading dashboard-heading">
        <div className="season-badge"><span>✦</span> BAND ROOM STATS</div>
        <h1>우리 모임에는<br/><em>어떤 취향이 모였을까요?</em></h1>
        <p>전체 참여 데이터를 재미있게 둘러보세요.</p>
      </div>
      {params.saved === "1" && <div className="notice success">취향을 저장했어요. 이제 다른 메이트들의 취향도 둘러보세요 ✦</div>}

      <section className="stats-hero">
        <div className="big-stat"><small>참여 완료</small><strong>{total}</strong><span>명</span></div>
        <div className="stats-copy"><span>THIS WINTER</span><h2>{total > 0 ? `${total}개의 취향이 한 무대에 모이고 있어요.` : "첫 번째 밴드 메이트를 기다리고 있어요."}</h2><a href="/onboarding">내 취향 등록하기 →</a></div>
      </section>

      <div className="dashboard-grid">
        <section className="magic-card chart-card">
          <div className="card-head"><div><small>PARTS</small><h2>어떤 파트가 모였나요?</h2></div><span>🎸</span></div>
          <div className="bar-list">
            {partRows.length ? partRows.map((r) => <div className="bar-row" key={r.key}><div className="bar-label"><b>{pm.get(r.key) ?? r.key}</b><span>{r.n}명</span></div><div className="bar-track"><i style={{width:`${Math.max(8, Number(r.n)/maxPart*100)}%`}}/></div></div>) : <Empty label="아직 파트 데이터가 없어요."/>}
          </div>
        </section>
        <section className="magic-card chart-card">
          <div className="card-head"><div><small>GENRES</small><h2>우리의 플레이리스트</h2></div><span>🎧</span></div>
          <div className="bar-list">
            {genreRows.length ? genreRows.slice(0,10).map((r) => <div className="bar-row" key={r.key}><div className="bar-label"><b>{gm.get(r.key) ?? r.key}</b><span>{r.n}명</span></div><div className="bar-track wine"><i style={{width:`${Math.max(8, Number(r.n)/maxGenre*100)}%`}}/></div></div>) : <Empty label="아직 장르 데이터가 없어요."/>}
          </div>
        </section>
      </div>
      <section className="coming-card"><span>✦</span><div><b>다음 매칭 기능</b><p>아티스트 취향, 희망곡, 합주 가능 시간까지 연결해 ‘왜 잘 맞는지’를 보여주는 추천 카드로 확장할 예정입니다.</p></div></section>
    </main>
  );
}

function Empty({label}:{label:string}) { return <div className="empty-state"><span>☾</span><p>{label}</p></div>; }
