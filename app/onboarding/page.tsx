import { currentParticipant } from "../../lib/auth";
import { GENRES, PARTS } from "../../lib/constants";
import { pool, q } from "../../lib/db";

export const dynamic="force-dynamic";
export default async function Onboarding(){
  const me=await currentParticipant();
  let selectedParts:string[]=[]; let selectedGenres:string[]=[];
  if(me){
    const [p,g]=await Promise.all([
      pool.query(`SELECT part_key FROM ${q("participant_parts")} WHERE participant_id=$1`,[me.id]),
      pool.query(`SELECT genre_key FROM ${q("participant_genres")} WHERE participant_id=$1`,[me.id])]);
    selectedParts=p.rows.map(x=>x.part_key); selectedGenres=g.rows.map(x=>x.genre_key);
  }
  return <main><h1>나의 밴드 취향</h1>{!me?<section className="panel"><h2>닉네임으로 입장</h2><form action="/api/auth/login" method="post"><label className="field">닉네임<input name="nickname" required minLength={2}/></label><label className="field">비밀번호<input name="password" type="password" required minLength={8}/></label><button className="btn primary">입장 / 처음이면 만들기</button></form></section>:<><section className="panel"><strong>{me.nickname}</strong>님, 이번 합주에서 원하는 정보를 골라주세요. <form action="/api/auth/logout" method="post" style={{display:"inline"}}><button className="btn">로그아웃</button></form></section><form className="panel" action="/api/preferences" method="post"><h2>파트</h2><div className="chips">{PARTS.map(([k,l])=><label className="chip" key={k}><input type="checkbox" name="parts" value={k} defaultChecked={selectedParts.includes(k)}/>{l}</label>)}</div><h2>장르</h2><div className="chips">{GENRES.map(([k,l])=><label className="chip" key={k}><input type="checkbox" name="genres" value={k} defaultChecked={selectedGenres.includes(k)}/>{l}</label>)}</div><button className="btn primary" style={{marginTop:22}}>저장하기</button></form></>}</main>
}
