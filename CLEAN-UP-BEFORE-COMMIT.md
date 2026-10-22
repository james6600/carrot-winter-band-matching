# 중요: 커밋 전에 GitHub 저장소 루트에서 오래된 잘못된 파일을 삭제하세요

이번 빌드 오류 중 `page.tsx`, `route.ts`처럼 경로 없이 찍힌 항목은 과거 웹 업로드 때 루트에 남은 파일입니다.

저장소 최상위(root)에 아래 패턴 파일이 있으면 삭제합니다.

- `page.tsx`
- `route.ts`
- `page (숫자).tsx`
- `route (숫자).ts`

정상 파일은 `app/` 아래에만 있어야 합니다.

정상 예시:
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/onboarding/page.tsx`
- `app/api/auth/login/route.ts`
- `app/api/preferences/route.ts`

삭제하면 안 되는 항목:
- `ops/` 전체 (Supabase SQL 포함)
- `public/`
- `lib/`
- `app/`
- `package.json`
- `tsconfig.json`
- `next.config.ts`
