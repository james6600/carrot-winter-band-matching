# GitHub에서 삭제해야 할 이전 잘못된 파일

프로젝트 루트(최상위)에 아래 파일이 남아 있다면 삭제하세요.

- `page.tsx`
- `route.ts`
- `page (1).tsx`, `page (2).tsx` 등 `page (숫자).tsx`
- `route (1).ts`, `route (2).ts`, `route (3).ts` 등 `route (숫자).ts`

정상 파일은 반드시 `app/...` 하위 폴더에 있어야 합니다.
예: `app/page.tsx`, `app/api/auth/login/route.ts`.
