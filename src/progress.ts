import {characters} from './curriculum';
export type Progress={seen:string[];written:string[];rounds:number};
export const storageKey='hanzi-garden-v1';
export const emptyProgress:Progress={seen:[],written:[],rounds:0};
export function parseProgress(raw:string|null):Progress{try{const p=JSON.parse(raw||'null');const clean=(x:unknown):string[]=>Array.isArray(x)?[...new Set<string>(x.filter((c:unknown)=>typeof c==='string'&&characters.some(x=>x.hanzi===c)))]:[];return {seen:clean(p?.seen),written:clean(p?.written),rounds:Number.isSafeInteger(p?.rounds)&&p.rounds>=0?p.rounds:0};}catch{return {...emptyProgress};}}
export function loadProgress(){try{return parseProgress(localStorage.getItem(storageKey));}catch{return {...emptyProgress};}}
export function addCharacter(p:Progress,key:'seen'|'written',char:string):Progress{return {...p,[key]:[...new Set([...p[key],char])]};}
