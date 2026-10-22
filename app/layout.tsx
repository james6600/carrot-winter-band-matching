import "./globals.css";
export const metadata = { title: "당근 밴드 메이커", description: "취향으로 찾는 밴드원 매칭" };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><div className="wrap"><nav className="nav"><a href="/" className="brand">🥕 <span>당근</span> 밴드 메이커</a><div className="links"><a href="/onboarding">취향 등록</a><a href="/dashboard">대시보드</a><a href="/admin">관리자</a></div></nav>{children}<footer className="footer">연말의 조명과 마법을 살짝 더한 밴드 매칭 도구 · carrot-winter-band-matching</footer></div></body></html>}
