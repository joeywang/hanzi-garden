import {useState} from 'react';
import {sentencePuzzles,wordPuzzles} from './adventures';
import {shuffle} from './curriculum';
import {useBadges} from './activityProgress';

type Mode='words'|'sentences';
export default function WordGames(){
 const [mode,setMode]=useState<Mode|null>(null);const [round,setRound]=useState(0);const [done,setDone]=useState(false);const [correct,setCorrect]=useState(false);const [feedback,setFeedback]=useState('');
 const [tokens,setTokens]=useState<number[]>([]);const [order,setOrder]=useState<number[]>([]);
 const [choices,setChoices]=useState<string[]>([]);
 const {badges,award,saveError}=useBadges('hanzi-word-games-v1',['words','sentences']);
 function prepare(type:Mode,index:number){setRound(index);setCorrect(false);setFeedback('');setOrder([]);if(type==='words')setChoices(shuffle(wordPuzzles[index].options));else {const mixed=shuffle([0,1,2,3]);setTokens(mixed.every((value,i)=>value===i)?[1,2,3,0]:mixed);}}
 function start(type:Mode){setMode(type);setDone(false);prepare(type,0);}
 const total=mode==='words'?wordPuzzles.length:sentencePuzzles.length;
 function next(){if(!mode||!correct)return;if(round===total-1){setDone(true);award(mode);}else prepare(mode,round+1);}
 function choose(value:string){const puzzle=wordPuzzles[round];const ok=value===puzzle.answer;setCorrect(ok);setFeedback(ok?`找到啦！${puzzle.prompt.replace('□',value)}`:'再想想线索里的意思，不着急。');}
 function checkSentence(){const puzzle=sentencePuzzles[round];const result=order.map(i=>puzzle.chunks[i]).join('');const ok=result===puzzle.sentence;setCorrect(ok);setFeedback(ok?'句子搭好啦！读给自己听一听。':'试着按照提示的顺序排列。日常说话也可以有别的表达，这里练习这一种顺序。');}
 return <section className="adventure-panel" aria-label="兴趣挑战"><div className="section-heading"><div><span className="eyebrow">给约 8–10 岁的小小探索家</span><h2>词句挑战站</h2></div><span>已探索 {badges.length} / 2 种挑战</span></div><p>从认一个字，走向读懂词语、搭出句子。没有计时器，不和别人比。</p><div className="adventure-toolbar"><button className="outline" onClick={()=>start('words')}>开始词语侦探</button><button className="outline" onClick={()=>start('sentences')}>开始句子工坊</button></div>
 {saveError&&<p role="status">浏览器不能保存新记录，仍然可以继续玩。</p>}
 {mode&&(done?<div className="adventure-celebration" role="status"><h3>这次挑战完成啦！</h3><p>你认真读过线索，还把自己的想法试了出来。</p><button className="primary" onClick={()=>start(mode)}>再探索一次</button></div>:<><p className="adventure-note">{mode==='words'?'词语侦探':'句子工坊'} · 第 {round+1} / {total} 题</p>{mode==='words'?<><h3 className="word-riddle">{wordPuzzles[round].prompt}</h3><p>🔎 {wordPuzzles[round].clue}</p><div className="adventure-options">{choices.map(value=><button className="outline word-choice" key={value} disabled={correct} aria-label={`填字：${value}`} onClick={()=>choose(value)}>{value}</button>)}</div></>:<><h3>把句块搭成一句话</h3><p>按这个顺序：{sentencePuzzles[round].clue}</p><div className="sentence-workbench" aria-label="你搭的句子" aria-live="polite">{order.length?order.map(i=>sentencePuzzles[round].chunks[i]).join(''):'点下面的句块，开始搭句子。'}</div><div className="adventure-options">{tokens.map(i=><button className="outline" key={i} disabled={correct||order.includes(i)} aria-label={`句块：${sentencePuzzles[round].chunks[i]}`} onClick={()=>{setOrder(previous=>[...previous,i]);setFeedback('');}}>{sentencePuzzles[round].chunks[i]}</button>)}</div><div className="adventure-toolbar"><button className="outline" disabled={!order.length||correct} onClick={()=>{setOrder(v=>v.slice(0,-1));setFeedback('');}}>撤回一块</button><button className="outline" disabled={!order.length||correct} onClick={()=>{setOrder([]);setFeedback('');}}>重新排列</button><button className="primary" disabled={order.length!==4||correct} onClick={checkSentence}>检查句子</button></div></>}
 <p role="status">{feedback}</p><button className="primary" disabled={!correct} onClick={next}>{round===total-1?'完成这次挑战':'下一题'}</button></>)}
 </section>;
}
