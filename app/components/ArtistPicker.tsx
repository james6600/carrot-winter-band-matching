'use client';

import { useEffect, useMemo, useState } from 'react';

type Artist = { name: string; genres?: string[]; region?: string; country?: string; artistType?: string };

export default function ArtistPicker({ initial = [] }: { initial?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial.slice(0, 10));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`);
        const j = await r.json();
        setResults(Array.isArray(j.artists) ? j.artists : []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, query ? 180 : 0);
    return () => clearTimeout(t);
  }, [query]);

  const available = useMemo(() => results.filter(a => !selected.some(s => s.toLowerCase() === a.name.toLowerCase())).slice(0, 12), [results, selected]);

  function add(name: string) {
    if (!name || selected.length >= 10) return;
    setSelected(v => [...v, name]);
    setQuery('');
  }

  function remove(index: number) { setSelected(v => v.filter((_, i) => i !== index)); }
  function move(index: number, delta: number) {
    setSelected(v => {
      const next = [...v]; const to = index + delta;
      if (to < 0 || to >= next.length) return v;
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  return <div className="artist-picker">
    {selected.map((name, index) => <div className="artist-rank-row" key={`${name}-${index}`}>
      <input type="hidden" name="artists" value={name}/>
      <span className="artist-rank">{index + 1}</span>
      <div><b>{name}</b><small>{index === 0 ? '최애 아티스트' : '좋아하는 순서'}</small></div>
      <div className="artist-rank-actions">
        <button type="button" onClick={() => move(index,-1)} disabled={index===0} aria-label="위로">↑</button>
        <button type="button" onClick={() => move(index,1)} disabled={index===selected.length-1} aria-label="아래로">↓</button>
        <button type="button" onClick={() => remove(index)} aria-label="삭제">×</button>
      </div>
    </div>)}
    {selected.length < 10 && <div className="artist-search-wrap">
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="아티스트 검색: Oasis, 실리카겔, King Gnu…" aria-label="아티스트 검색"/>
      <div className="artist-results">
        {loading ? <span className="artist-search-status">찾는 중…</span> : available.map(a => <button type="button" key={a.name} onClick={()=>add(a.name)}>
          <b>{a.name}</b><small>{[a.country, ...(a.genres ?? []).slice(0,2)].filter(Boolean).join(' · ') || '아티스트'}</small>
        </button>)}
      </div>
    </div>}
    <p className="artist-picker-help">최대 10명 · 위에 있을수록 매칭 점수에 더 크게 반영돼요.</p>
  </div>;
}
