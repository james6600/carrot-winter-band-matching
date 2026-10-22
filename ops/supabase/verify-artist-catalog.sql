-- Safe read-only checks for the artist-matching feature.
select table_name
from information_schema.tables
where table_schema = 'carrot_winter_band_matching'
  and table_name in ('artists','artist_genres')
order by table_name;

select column_name, data_type
from information_schema.columns
where table_schema = 'carrot_winter_band_matching'
  and table_name = 'participants'
  and column_name = 'artists_json';

-- Run this line only if the artists table exists according to the first result.
select count(*)::int as artist_count
from carrot_winter_band_matching.artists;
