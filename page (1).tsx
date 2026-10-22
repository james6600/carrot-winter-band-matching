import { currentParticipant } from "../../lib/auth";
import { GENRES, PARTS } from "../../lib/constants";
import { pool, q } from "../../lib/db";

export const dynamic = "force-dynamic";

const partIcons: Record<string, string> = {
  guitar: "🎸", drums: "🥁", bass: "🎵", vocal: "🎤", keyboard: "🎹", other: "✨",
};

export default async function Onboarding({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const me = await currentParticipant();
  let selectedParts: string[] = [];
  let selectedGenres: string[] = [];

  if (me) {
    const [p, g] = await Promise.all([
      pool.query(`SELECT part_key FROM ${q("participant_parts")} WHERE participant_id=$1`, [me.id]),
      pool.query(`SELECT genre_key FROM ${q("participant_genres")} WHERE participant_id=$1`, [me.id]),
    ]);
    selectedParts = p.rows.map((x) => x.part_key);
    selectedGenres = g.rows.map((x) => x.genre_key);
  }

  const error = params.error;
  return (
    <main className="content-page onboarding-page">
      <div className="page-heading">
        <div className="season-badge"><span>✦</span> THE SORTING SESSION</div>
        <h1>{me ? <>당신의 <em>밴드 취향</em>을<br/>조금 더 들려주세요.</> : <>합주 메이트를 찾기 전에<br/><em>먼저 입장해 주세요.</em></>}</h1>
        <p>{me ? "파트와 음악 취향을 여러 개 선택할 수 있어요." : "회원가입 절차 없이 닉네임과 비밀번호만 정하면 시작할 수 있어요."}</p>
      </div>

      {!me ? (
        <div className="login-layout">
          <section className="magic-card login-card">
            <div className="card-icon">🎩</div>
            <div className="section-label">BAND PASS</div>
            <h2>닉네임으로 입장</h2>
            <p className="muted">처음 사용하는 닉네임이면 바로 만들어지고, 다음부터 같은 비밀번호로 다시 들어올 수 있어요.</p>
            {error === "password" && <div className="notice error">비밀번호가 맞지 않아요. 같은 닉네임의 기존 참가자가 있습니다.</div>}
            {error === "input" && <div className="notice error">닉네임은 2자 이상, 비밀번호는 8자 이상 입력해 주세요.</div>}
            {error === "db" && <div className="notice error">데이터베이스 연결을 확인해 주세요. Vercel의 DATABASE_URL과 Supabase 스키마 적용 상태를 점검해야 합니다.</div>}
            {error === "session" && <div className="notice error">로그인 세션을 확인하지 못했어요. 다시 로그인해 주세요.</div>}
            <form action="/api/auth/login" method="post" className="form-stack">
              <label className="input-field"><span>닉네임</span><input name="nickname" autoComplete="username" placeholder="예: 페퍼민트" required minLength={2}/></label>
              <label className="input-field"><span>비밀번호</span><input name="password" type="password" autoComplete="current-password" placeholder="8자 이상" required minLength={8}/></label>
              <button className="button primary full" type="submit">입장하고 취향 고르기 <span>→</span></button>
            </form>
            <p className="privacy-note">🔒 비밀번호 원문은 저장하지 않습니다.</p>
          </section>

          <aside className="login-side-card">
            <div className="side-spark">✦</div>
            <h3>이번 겨울 합주에서<br/>누구를 만나게 될까요?</h3>
            <ul>
              <li><span>🎸</span><div><b>필요한 파트</b><small>내가 찾는 악기와 연결</small></div></li>
              <li><span>🎧</span><div><b>비슷한 음악 취향</b><small>장르와 아티스트로 비교</small></div></li>
              <li><span>✨</span><div><b>마법 모자 스타일</b><small>취향을 재미있게 한 줄로</small></div></li>
            </ul>
          </aside>
        </div>
      ) : (
        <>
          <section className="member-banner">
            <div><span className="member-avatar">🥕</span><div><small>WELCOME BACK</small><strong>{me.nickname}</strong></div></div>
            <form action="/api/auth/logout" method="post"><button className="button small ghost">로그아웃</button></form>
          </section>
          <form className="preference-form" action="/api/preferences" method="post">
            <section className="magic-card preference-card">
              <div className="step-title"><span>01</span><div><h2>이번에 맡고 싶은 파트</h2><p>할 수 있는 파트를 모두 골라주세요.</p></div></div>
              <div className="choice-grid part-grid">
                {PARTS.map(([k, l]) => (
                  <label className="choice-card" key={k}>
                    <input type="checkbox" name="parts" value={k} defaultChecked={selectedParts.includes(k)}/>
                    <span className="choice-icon">{partIcons[k]}</span><b>{l}</b><small>선택하기</small>
                  </label>
                ))}
              </div>
            </section>

            <section className="magic-card preference-card">
              <div className="step-title"><span>02</span><div><h2>좋아하는 음악 장르</h2><p>내 플레이리스트에 자주 나오는 장르를 여러 개 골라주세요.</p></div></div>
              <div className="genre-grid">
                {GENRES.map(([k, l]) => (
                  <label className="genre-chip" key={k}>
                    <input type="checkbox" name="genres" value={k} defaultChecked={selectedGenres.includes(k)}/><span>{l}</span>
                  </label>
                ))}
              </div>
            </section>
            <div className="save-bar"><div><span>✦</span><p><b>선택을 마쳤나요?</b><small>저장하면 전체 통계에서 내 취향도 함께 보여요.</small></p></div><button className="button primary" type="submit">취향 저장하기 <span>→</span></button></div>
          </form>
        </>
      )}
    </main>
  );
}
