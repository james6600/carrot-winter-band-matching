# 당근 밴드 메이커 / carrot-winter-band-matching

Vercel + Supabase(PostgreSQL) 배포용 소스입니다.

## 1. Supabase
1. Supabase 프로젝트의 SQL Editor를 엽니다.
2. `ops/supabase/carrot-winter-band-matching-schema.sql` 전체를 실행합니다.
3. 마지막 결과의 `application_table_count`가 13인지 확인합니다.
4. Connect > Transaction pooler에서 PostgreSQL 연결 주소를 복사합니다.

## 2. Vercel Environment Variables
Production에 다음 4개를 등록합니다.
- `DATABASE_URL`: Supabase Transaction pooler 주소
- `ADMIN_USERNAME`: `spongebob`
- `ADMIN_PASSWORD_HASH`: PBKDF2-SHA256 100,000회, 32바이트 hex
- `ADMIN_PASSWORD_SALT`: 위 hash에 사용한 hex salt

비밀번호/DB URL은 GitHub에 commit하지 마세요.

## 3. GitHub 업로드
빈 GitHub 저장소 `carrot-winter-band-matching`의 Code 화면에서 `uploading an existing file`을 누르고, 이 ZIP을 푼 뒤 **ZIP 파일 자체가 아니라 압축을 푼 모든 파일과 폴더**를 업로드하세요.

최상위에 다음이 보여야 합니다.
- `package.json`
- `app/`
- `lib/`
- `ops/`
- `README.md`

Commit message: `Initial Vercel Supabase app`

## 4. Vercel
GitHub 연결이 이미 되어 있으면 `main` 첫 commit이 생기는 순간 자동 배포가 시작됩니다.
Framework Preset은 Next.js로 감지되어야 합니다.

## 5. 현재 포함된 기능
- 닉네임 + 비밀번호 참여자 로그인/생성
- 파트/장르 중복 선택 및 DB 저장
- 전체 파트/장르 대시보드
- 관리자 로그인 및 참여자 목록
- 관리자 세션 8시간
- PostgreSQL 13개 테이블 스키마
- 연말/마법/밴드 무대 테마

## 다음 확장
이 패키지는 안정적인 Vercel+Supabase 시작점입니다. 이전 사이트의 1,377개 아티스트 카탈로그 전체 데이터와 상세 매칭/관리자 병합 UI는 별도 import가 필요합니다.
