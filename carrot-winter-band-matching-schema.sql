create schema if not exists carrot_winter_band_matching;
create extension if not exists pgcrypto;

create table if not exists carrot_winter_band_matching.participants (
  id uuid primary key default gen_random_uuid(), nickname text not null,
  normalized_nickname text not null unique, password_hash text not null, password_salt text not null,
  completed boolean not null default false, share_profile boolean not null default true,
  merged_into uuid references carrot_winter_band_matching.participants(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists carrot_winter_band_matching.participant_sessions (
  id bigserial primary key, participant_id uuid not null references carrot_winter_band_matching.participants(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table if not exists carrot_winter_band_matching.admin_sessions (
  id bigserial primary key, token_hash text not null unique, expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table if not exists carrot_winter_band_matching.participant_parts (
  participant_id uuid not null references carrot_winter_band_matching.participants(id) on delete cascade,
  part_key text not null, other_label text, primary key(participant_id,part_key)
);
create table if not exists carrot_winter_band_matching.participant_genres (
  participant_id uuid not null references carrot_winter_band_matching.participants(id) on delete cascade,
  genre_key text not null, primary key(participant_id,genre_key)
);
create table if not exists carrot_winter_band_matching.artists (
  id uuid primary key default gen_random_uuid(), slug text unique, name text not null, normalized_name text not null,
  region text, country text, artist_type text not null default 'band', short_note text,
  status text not null default 'verified', research_status text not null default 'curated',
  source_url text, created_by_participant_id uuid references carrot_winter_band_matching.participants(id),
  reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists artists_normalized_name_unique on carrot_winter_band_matching.artists(normalized_name);
create table if not exists carrot_winter_band_matching.artist_aliases (
  artist_id uuid not null references carrot_winter_band_matching.artists(id) on delete cascade,
  alias text not null, normalized_alias text not null, primary key(artist_id,normalized_alias)
);
create index if not exists artist_alias_lookup on carrot_winter_band_matching.artist_aliases(normalized_alias);
create table if not exists carrot_winter_band_matching.artist_genres (
  artist_id uuid not null references carrot_winter_band_matching.artists(id) on delete cascade,
  genre_key text not null, primary key(artist_id,genre_key)
);
create table if not exists carrot_winter_band_matching.participant_artist_preferences (
  participant_id uuid not null references carrot_winter_band_matching.participants(id) on delete cascade,
  artist_id uuid not null references carrot_winter_band_matching.artists(id) on delete cascade,
  rank smallint not null check(rank between 1 and 20), primary key(participant_id,artist_id), unique(participant_id,rank)
);
create table if not exists carrot_winter_band_matching.teams (
  id uuid primary key default gen_random_uuid(), name text not null, status text not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists carrot_winter_band_matching.team_members (
  team_id uuid not null references carrot_winter_band_matching.teams(id) on delete cascade,
  participant_id uuid not null references carrot_winter_band_matching.participants(id) on delete cascade,
  part_key text, primary key(team_id,participant_id)
);
create table if not exists carrot_winter_band_matching.audit_logs (
  id bigserial primary key, actor_type text not null, actor_id text, action text not null,
  entity_type text not null, entity_id text, detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists carrot_winter_band_matching.nickname_aliases (
  alias_normalized text primary key, participant_id uuid not null references carrot_winter_band_matching.participants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists participant_sessions_expiry on carrot_winter_band_matching.participant_sessions(expires_at);
create index if not exists admin_sessions_expiry on carrot_winter_band_matching.admin_sessions(expires_at);
create index if not exists participant_parts_key on carrot_winter_band_matching.participant_parts(part_key);
create index if not exists participant_genres_key on carrot_winter_band_matching.participant_genres(genre_key);

-- Keep these tables server-only. Do not expose them through anonymous Supabase API access.
revoke all on schema carrot_winter_band_matching from anon, authenticated;
revoke all on all tables in schema carrot_winter_band_matching from anon, authenticated;
revoke all on all sequences in schema carrot_winter_band_matching from anon, authenticated;

select 'carrot_winter_band_matching' as schema_name,
       count(*)::int as application_table_count
from information_schema.tables
where table_schema='carrot_winter_band_matching' and table_type='BASE TABLE';
