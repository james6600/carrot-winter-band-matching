const partLinks = [
  ["🎸", "기타"], ["🥁", "드럼"], ["🎵", "베이스"],
  ["🎤", "보컬"], ["🎹", "키보드"], ["✨", "기타 악기"],
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-copy">
        <div className="season-badge"><span>✦</span> YEAR-END BAND MATCHING</div>
        <p className="kicker">이번 겨울, 같이 연주할 사람을 찾아요.</p>
        <h1>취향이 맞는 우리,<br/><em>함께 밴드 해요.</em></h1>
        <p className="hero-lead">
          연주할 파트와 좋아하는 음악을 고르면<br className="desktop-only"/>
          비슷한 취향의 밴드원을 찾아드려요.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/onboarding"><span>✦</span> 나의 밴드 취향 찾기</a>
          <a className="button ghost" href="/dashboard">먼저 둘러보기 <span>→</span></a>
        </div>
        <div className="part-quicklinks" aria-label="파트별 밴드원 찾기">
          {partLinks.map(([icon, name]) => (
            <a key={name} href="/dashboard" className="part-mini"><span>{icon}</span>{name}</a>
          ))}
        </div>
      </section>

      <section className="hero-stage" aria-label="당근 밴드 무대">
        <div className="garland" aria-hidden="true">✦ · ✦ · ✦ · ✦ · ✦ · ✦</div>
        <img src="/assets/carrot-band-stage.png" alt="기타, 드럼, 키보드로 합주하는 당근 밴드" />
        <div className="stage-caption">
          <span className="live-dot"/> WINTER SESSION
          <b>나랑 맞는 밴드원을 찾아보세요</b>
        </div>
      </section>

      <section className="feature-strip">
        <article><span>01</span><b>파트를 고르고</b><p>이번 합주에서 맡고 싶은 악기를 선택해요.</p></article>
        <article><span>02</span><b>취향을 들려주고</b><p>장르와 좋아하는 아티스트로 음악 취향을 표현해요.</p></article>
        <article><span>03</span><b>메이트를 만나고</b><p>비슷한 취향과 필요한 파트를 연결해요.</p></article>
      </section>
    </main>
  );
}
