import "./globals.css";

export const metadata = {
  title: "당근 밴드 메이커",
  description: "취향과 파트로 찾는 겨울 밴드원 매칭",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="snow" aria-hidden="true"><i/><i/><i/></div>
        <div className="site-shell">
          <header className="topbar">
            <a href="/" className="brand" aria-label="당근 밴드 메이커 홈">
              <span className="brand-mark">🥕</span>
              <span><b>당근</b> 밴드 메이커</span>
            </a>
            <nav className="desktop-nav" aria-label="주요 메뉴">
              <a href="/onboarding">취향 등록</a>
              <a href="/dashboard">대시보드</a>
              <a href="/admin">관리자</a>
            </nav>
          </header>
          {children}
          <footer className="footer">
            <span>CARROT BAND MAKER</span>
            <span>연말의 작은 마법 · 중심은 합주와 사람</span>
          </footer>
        </div>
        <nav className="mobile-nav" aria-label="모바일 메뉴">
          <a href="/"><span>✦</span>홈</a>
          <a href="/onboarding"><span>🎸</span>취향</a>
          <a href="/dashboard"><span>📊</span>통계</a>
          <a href="/admin"><span>⚙</span>관리</a>
        </nav>
      </body>
    </html>
  );
}
