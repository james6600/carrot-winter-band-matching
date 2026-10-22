# 로그인 이후 동작 점검

1. Supabase SQL Editor에서 `ops/supabase/carrot-winter-band-matching-schema.sql` 전체를 실행합니다.
2. 이어서 `ops/supabase/verify.sql`을 실행하고 13개 테이블이 보이는지 확인합니다.
3. Vercel > Environment Variables에서 `DATABASE_URL`이 Production에 등록되어 있는지 확인합니다.
4. 새 커밋으로 배포한 뒤 브라우저에서 `/api/health/db`를 엽니다.
   - `{"ok":true,...}` 이면 DB 연결 정상입니다.
   - `DATABASE_URL_MISSING`이면 Vercel 환경변수가 누락되었습니다.
   - `SCHEMA_INCOMPLETE`이면 Supabase SQL 스키마를 다시 실행합니다.
   - `DATABASE_CONNECTION_FAILED`이면 pooler 주소/비밀번호를 확인합니다.
5. `/onboarding`에서 새 닉네임 + 8자 이상 비밀번호로 로그인합니다.
6. 파트/장르 선택 후 저장하여 `/dashboard?saved=1`로 이동하는지 확인합니다.
