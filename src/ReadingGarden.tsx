import {useState} from 'react';
import {stories,type Story} from './adventures';
import {useBadges} from './activityProgress';

const levels=['','轻松起步','找找线索','想深一点'];
export default function ReadingGarden(){
 const [selected,setSelected]=useState<Story|null>(null);const [filter,setFilter]=useState('all');const [search,setSearch]=useState('');
 const [answers,setAnswers]=useState<(string|null)[]>([]);const [large,setLarge]=useState(false);const [pinyin,setPinyin]=useState(true);
 const {badges,award,saveError}=useBadges('hanzi-reading-v1',stories.map(s=>s.id));
 function open(story:Story){setSelected(story);setAnswers(story.questions.map(()=>null));}
 function answer(index:number,value:string){if(!selected)return;const next=[...answers];next[index]=value;setAnswers(next);if(selected.questions.every((q,i)=>next[i]===q.answer))award(selected.id);}
 const filtered=stories.filter(s=>(filter==='all'||String(s.level)===filter)&&`${s.title}${s.topic}${s.paragraphs.join('')}`.includes(search.trim()));
 return <section className="reading-garden"><div className="page-intro"><span className="eyebrow">给好奇心，一片更大的森林</span><h1>阅读探险馆</h1><p>8 篇原创短文 · 适合约 8–10 岁兴趣拓展。难度不是年级或考试等级，可以请大人陪读。</p><p>完成阅读小问题：{badges.length} / {stories.length} 篇。不计时、不排名，线索随时可以看。</p></div>
 {saveError&&<p role="status">这次仍然可以阅读，但浏览器暂时无法保存新记录。</p>}
 {!selected?<><div className="adventure-toolbar"><label>阅读难度 <select aria-label="阅读难度" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">全部难度</option>{[1,2,3].map(level=><option value={level} key={level}>{level} · {levels[level]}</option>)}</select></label><label>寻找文章 <input type="search" aria-label="搜索阅读文章" value={search} onChange={e=>setSearch(e.target.value)} placeholder="月亮、机器人、花园…"/></label></div><div className="adventure-cards">{filtered.map(story=><button className="adventure-card" key={story.id} aria-label={`阅读：${story.title}`} onClick={()=>open(story)}><span className="adventure-icon" aria-hidden="true">{story.emoji}</span><small>{story.topic} · {levels[story.level]}</small><h2>{story.title}</h2><p>{story.paragraphs[0].slice(0,35)}…</p><span>{badges.includes(story.id)?'🌿 已完成小问题 · 再读一次':'打开故事 →'}</span></button>)}</div>{!filtered.length&&<p>没有找到这篇文章，换一个关键词试试。</p>}</>:<>
 <div className="adventure-toolbar"><button className="outline" onClick={()=>setSelected(null)}>← 返回文章列表</button><button className="outline" aria-pressed={large} onClick={()=>setLarge(v=>!v)}>大字阅读</button><button className="outline" aria-pressed={pinyin} onClick={()=>setPinyin(v=>!v)}>词语拼音 {pinyin?'开':'关'}</button></div>
 <article className={`adventure-panel story-text ${large?'large-reading':''}`} aria-label={selected.title}><span className="eyebrow">{selected.topic} · 原创短文 · {levels[selected.level]}</span><h2>{selected.emoji} {selected.title}</h2>{selected.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}<p className="adventure-note">本文没有整篇录音；词语栏提供拼音帮助。遇到难处可以请大人一起读。</p></article>
 <section className="adventure-panel" aria-label="词语工具箱"><h2>🧰 词语工具箱</h2><div className="glossary-grid">{selected.glossary.map(g=><div key={g.word}><h3>{g.word}</h3>{pinyin&&<p lang="zh-Latn">{g.pinyin}</p>}<p>{g.meaning}</p></div>)}</div></section>
 <section className="adventure-panel"><h2>🔎 带着线索，想一想</h2><p>答错可以重选。看看原文线索，也是一种很好的阅读方法。</p>{selected.questions.map((question,i)=><fieldset className="reading-question" key={`${selected.id}-${i}`}><legend>{i+1}. {question.prompt}</legend><div className="adventure-options">{question.options.map(option=><button className="outline" key={option} aria-label={`第${i+1}题：${option}`} aria-pressed={answers[i]===option} onClick={()=>answer(i,option)}>{option}</button>)}</div><div role="status">{answers[i]&&(answers[i]===question.answer?<p>✓ 找到啦！</p>:<p>再读一读线索，你可以重新选择。</p>)}</div><details><summary>看看原文线索</summary><blockquote>{question.evidence}</blockquote></details></fieldset>)}{selected.questions.every((q,i)=>answers[i]===q.answer)&&<div className="adventure-celebration" role="status"><h3>这篇的小问题都完成啦！</h3><p>记录的是这次练习，不代表已经掌握全文。愿意的话，再讲讲你自己的发现。</p></div>}</section>
 <section className="adventure-panel"><h2>💬 没有唯一答案的小讨论</h2><p>{selected.talk}</p><p className="adventure-note">可以说给家人听，也可以画下来。这里不录音、不上传，也不给观点打分。</p><button className="primary" onClick={()=>setSelected(null)}>去找下一篇故事 →</button></section></>}
 </section>;
}
