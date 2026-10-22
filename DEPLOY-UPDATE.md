# 디자인 복구 배포

이 패키지는 초기 블랙톤/겨울/마법/밴드 무대 디자인을 복구하고 로그인 이후 화면을 반응형으로 다시 구성한 버전입니다.

GitHub 기존 저장소에 이 패키지의 파일을 덮어쓴 뒤 main에 커밋하면 Vercel Git Integration이 자동 재배포합니다.

Vercel 설정:
- Framework Preset: Next.js
- Output Directory: Default (public 입력 금지)
- Build Command: Default
- 환경변수: DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_PASSWORD_SALT

중요: 실제 비밀값은 이 저장소 파일 안에 넣지 말고 Vercel Environment Variables에만 등록하세요.
