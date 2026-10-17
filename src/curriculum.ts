import raw from './characters.json';
export type Character={hanzi:string;pinyin:string;audio:string;meaning:string;radical:string;words:string[];sentence:string;emoji:string;tip:string};
export const characters:Character[]=raw;
export const themes=[
 {id:'first',title:'我的第一批汉字',english:'My first characters',subtitle:'一笔一画，从这里出发',emoji:'🌱',color:'green',chars:['一','二','三','十','人','口']},
 {id:'nature',title:'看见大自然',english:'Hello, nature',subtitle:'日月山水，都有自己的名字',emoji:'🏔️',color:'blue',chars:['日','月','水','火','山','石']},
 {id:'plants',title:'小小植物园',english:'A little plant garden',subtitle:'一棵树，一朵花，一粒米',emoji:'🌿',color:'green',chars:['木','林','竹','禾','米','花']},
 {id:'earth',title:'天地之间',english:'Sky and earth',subtitle:'抬头看云，低头看田',emoji:'☁️',color:'blue',chars:['天','地','土','田','云','雨']},
 {id:'opposites',title:'发现不一样',english:'Big, small and beyond',subtitle:'大和小，上和下，你发现了吗',emoji:'🪁',color:'gold',chars:['大','小','上','下','中','多']},
 {id:'body',title:'认识我自己',english:'My amazing body',subtitle:'小手会写字，耳朵会听音',emoji:'🖐️',color:'rose',chars:['手','足','目','耳','心','力']},
 {id:'family',title:'我和我的家',english:'My family and me',subtitle:'你好！很高兴认识你',emoji:'🏡',color:'rose',chars:['爸','妈','子','女','我','你']},
 {id:'animals',title:'动物好朋友',english:'Animal friends',subtitle:'谁在跑，谁在飞，谁在游',emoji:'🐼',color:'gold',chars:['牛','羊','马','鸟','虫','鱼']},
];
export function shuffle<T>(values:T[]):T[]{const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function optionsFor(target:string,pool:string[]):string[]{return shuffle([target,...shuffle([...new Set(pool)].filter(c=>c!==target)).slice(0,3)]);}
export function matchWord(c:Character){return {prompt:c.words[0].replace(c.hanzi,'□'),answer:c.hanzi};}
export function listeningOptionsFor(c:Character,pool:Character[]){return optionsFor(c.hanzi,pool.filter(x=>x.hanzi===c.hanzi||x.audio!==c.audio).map(x=>x.hanzi));}
export function wordOptionsFor(c:Character){const distractors=shuffle([...new Set(characters.flatMap(x=>x.words))].filter(w=>!w.includes(c.hanzi))).slice(0,3);return shuffle([c.words[0],...distractors]);}
export const characterFor=(char:string)=>characters.find(c=>c.hanzi===char)!;
