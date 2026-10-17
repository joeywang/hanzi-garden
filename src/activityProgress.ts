import {useState} from 'react';
export function useBadges(key:string,allowed:string[]){
 const [badges,setBadges]=useState<string[]>(()=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?[...new Set<string>(v.filter((x:unknown)=>typeof x==='string'&&allowed.includes(x)))]:[];}catch{return [];}});
 const [saveError,setSaveError]=useState(false);
 function award(id:string){if(!allowed.includes(id))return;const next=[...new Set([...badges,id])];setBadges(next);try{localStorage.setItem(key,JSON.stringify(next));setSaveError(false);}catch{setSaveError(true);}}
 return {badges,award,saveError};
}
