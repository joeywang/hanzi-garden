import {useEffect,useRef,useState} from 'react';
export function useBadges(key:string,allowed:string[]){
 const allowedIds=useRef(allowed);allowedIds.current=allowed;
 function parse(raw:string|null):string[]{try{const value=JSON.parse(raw||'null');return Array.isArray(value)?[...new Set<string>(value.filter((x:unknown)=>typeof x==='string'&&allowedIds.current.includes(x)))]:[];}catch{return [];}}
 const [badges,setBadges]=useState<string[]>(()=>{try{return parse(localStorage.getItem(key));}catch{return [];}});
 const [saveError,setSaveError]=useState(false);
 useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key===key||event.key===null)setBadges(parse(event.newValue));};window.addEventListener('storage',sync);return ()=>window.removeEventListener('storage',sync);},[key]);
 function award(id:string){if(!allowedIds.current.includes(id))return;try{const latest=parse(localStorage.getItem(key));const next=[...new Set([...latest,id])];localStorage.setItem(key,JSON.stringify(next));setBadges(next);setSaveError(false);}catch{setBadges(previous=>[...new Set([...previous,id])]);setSaveError(true);}}
 return {badges,award,saveError};
}
