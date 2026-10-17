import {useEffect,useState} from 'react';
export type ThemePreference='system'|'light'|'dark';
const storageKey='hanzi-garden-theme-v1';
export function readTheme():ThemePreference{try{const value=localStorage.getItem(storageKey);return value==='light'||value==='dark'?value:'system';}catch{return 'system';}}
export function resolveTheme(preference:ThemePreference){return preference==='system'?(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'):preference;}
export function applyTheme(preference:ThemePreference){const resolved=resolveTheme(preference);document.documentElement.dataset.theme=resolved;return resolved;}
export function useTheme(){
 const [preference,setPreference]=useState<ThemePreference>(readTheme);
 const [resolved,setResolved]=useState(()=>resolveTheme(preference));
 const [saveError,setSaveError]=useState(false);
 useEffect(()=>{const update=()=>setResolved(applyTheme(preference));update();const media=window.matchMedia?.('(prefers-color-scheme: dark)');media?.addEventListener('change',update);return ()=>media?.removeEventListener('change',update);},[preference]);
 function choose(value:ThemePreference){setPreference(value);setResolved(applyTheme(value));try{localStorage.setItem(storageKey,value);setSaveError(false);}catch{setSaveError(true);}}
 return {preference,resolved,choose,saveError};
}
export default function ThemeControl({theme,chinese=false}:{theme:ReturnType<typeof useTheme>;chinese?:boolean}){
 return <div className="theme-control"><label><span aria-hidden="true">◐</span> {chinese?'外观':'Appearance'} <select aria-label={chinese?'显示主题':'Colour theme'} value={theme.preference} onChange={e=>theme.choose(e.target.value as ThemePreference)}><option value="system">{chinese?'跟随系统':'System'}</option><option value="light">{chinese?'浅色':'Light'}</option><option value="dark">{chinese?'深色':'Dark'}</option></select></label>{theme.saveError&&<span role="status">{chinese?'当前主题可用，但浏览器无法记住选择。':'Theme applied; this browser cannot remember your choice.'}</span>}</div>;
}
