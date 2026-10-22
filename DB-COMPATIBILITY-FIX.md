# Supabase compatibility fix

This package aligns participant authentication and preference flows with the currently deployed Supabase schema:

- participant sessions: `carrot_winter_band_matching.sessions`
- `sessions.expires_at`: bigint Unix epoch milliseconds
- participant preference columns: `participants.parts_json` and `participants.genres_json`
- participant id: text with `gen_random_uuid()::text` default in the live database

Updated flows:

1. Login / account creation
2. Participant session lookup
3. Logout
4. Onboarding preference loading
5. Preference save
6. Dashboard part / genre aggregation

Do not re-run the older baseline schema SQL over the live database just to fix login; the live database already uses a different compatible schema shape.
