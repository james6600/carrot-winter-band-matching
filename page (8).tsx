import { isAdmin } from "../../lib/auth";
import { pool, q } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const ok = await isAdmin();
  if (!ok) return (
    <main className="content-page admin-login-page">
      <div className="admin-login-wrap">
        <section className="magic-card login-card admin-login-card">
          <div className="card-icon">🔑</div><div className="section-label">SUPER ADMIN</div>
          <h1>관리자 입장</h1><p className="muted">참여자와 아티스트 데이터를 관리하는 전용 공간입니다.</p>
          {params.error === "login" && <div className="notice error">관리자 ID 또는 비밀번호를 확인해 주세요.</div>}
          <form action="/api/admin/login" method="post" className="form-stack">
            <label className="input-field"><span>ID</span><input name="username" autoComplete="username" required placeholder="관리자 ID"/></label>
            <label className="input-field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required placeholder="관리자 비밀번호"/></label>
            <button className="button primary full">관리자 로그인 <span>→</span></button>
          </form>
        </section>
      </div>
    </main>
  );

  const rows = (await pool.query(`SELECT id,nickname,completed,created_at FROM ${q("participants")} WHERE merged_into IS NULL ORDER BY created_at DESC LIMIT 200`)).rows;
  return (
    <main className="content-page admin-page">
      <div className="admin-top"><div><div className="section-label">SUPER ADMIN</div><h1>운영 대시보드</h1><p>참여자 현황과 운영 데이터를 확인하세요.</p></div><form action="/api/admin/logout" method="post"><button className="button ghost">로그아웃</button></form></div>
      <section className="magic-card admin-summary"><div><small>참여자</small><strong>{rows.length}</strong><span>명</span></div><p>현재 병합되지 않은 참여자 계정 기준입니다.</p></section>
      <section className="magic-card table-card"><div className="card-head"><div><small>PARTICIPANTS</small><h2>참여자 목록</h2></div><span>🥕</span></div><div className="responsive-table"><table><thead><tr><th>닉네임</th><th>상태</th><th>가입일</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.nickname}</b></td><td><span className={`status-pill ${r.completed?"done":"draft"}`}>{r.completed?"완료":"작성중"}</span></td><td>{new Date(r.created_at).toLocaleDateString("ko-KR")}</td></tr>)}</tbody></table></div></section>
    </main>
  );
}
