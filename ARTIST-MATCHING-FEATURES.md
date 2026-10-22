# Artist matching restored

This build restores the core meetup features that were missing from the transition build.

- Onboarding artist search and ranked favorite artists (up to 10)
- Favorites stored in participants.artists_json in rank order
- Live DB artist catalog is preferred (`artists`, plus `artist_genres` when available)
- Built-in starter metadata is used only as a resilient fallback/supplement
- Matching score: ranked shared artists 52%, artist-derived genre similarity 20%, selected genres 18%, part combination 10%
- Dashboard part/genre/artist bars are clickable
- Clicking a count/bar opens the participants who selected it
- Top artist statistics are visible and clickable

Important: the earlier large artist catalog is not fabricated into this ZIP. If that catalog is already present in Supabase `carrot_winter_band_matching.artists`, the app now reads and uses it automatically. Verify the live count with `ops/supabase/verify-artist-catalog.sql`.
