import {useEffect,useRef,useState} from 'react';
import HanziWriter from 'hanzi-writer';
// Pinned Hanzi Writer 3.7.3 attaches two document-level end listeners but has
// no public destroy(). Scope just those listeners to the mounted pad's lifetime.
class ManagedWriter extends HanziWriter {
 declare private endListeners:AbortController;
 _setupListeners(){
  this.endListeners=new AbortController();
  this.target.addPointerEndListener=callback=>{
   document.addEventListener('mouseup',callback,{signal:this.endListeners.signal});
   document.addEventListener('touchend',callback,{signal:this.endListeners.signal});
  };
  super._setupListeners();
 }
 dispose(loaded:boolean){this.endListeners.abort();this.cancelQuiz();if(loaded)void this.pauseAnimation();}
}
export default function WritingPad({char,onWatched,onWritten,english,dark=false}:{char:string;onWatched:()=>void;onWritten:()=>void;english:boolean;dark?:boolean}){
 const host=useRef<HTMLDivElement>(null);const writer=useRef<ManagedWriter|null>(null);
 const callbacks=useRef({onWatched,onWritten});callbacks.current={onWatched,onWritten};
 const [ready,setReady]=useState(false);const [error,setError]=useState(false);const [retry,setRetry]=useState(0);
 const [count,setCount]=useState(0);const [mode,setMode]=useState<'rest'|'watch'|'write'|'complete'>('rest');
 const [status,setStatus]=useState('准备好，看一看这个字。');const [nextStroke,setNextStroke]=useState(0);const generation=useRef(0);
 useEffect(()=>{
  const node=host.current!;node.replaceChildren();setReady(false);setError(false);setMode('rest');setCount(0);setNextStroke(0);setStatus('准备好，看一看这个字。');
  let active=true;let loaded=false;const controller=new AbortController();generation.current++;const mine=generation.current;
  const instance=new ManagedWriter(node,{width:280,height:280,padding:22,strokeColor:'#314c43',radicalColor:'#567657',outlineColor:'#e5e5da',highlightColor:'#d5a55e',drawingColor:'#527c66',drawingWidth:10,showOutline:true,showCharacter:true,strokeAnimationSpeed:1.2,delayBetweenStrokes:330,
   charDataLoader:(character,onLoad,onError)=>{fetch(`/strokes/${encodeURIComponent(character)}.json`,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json();}).then(data=>{if(active)onLoad(data);}).catch(e=>{if(active)onError(e);});},
    onLoadCharDataSuccess:data=>{if(active&&mine===generation.current){loaded=true;setCount(data.strokes.length);setReady(true);}},
   onLoadCharDataError:()=>{if(active){setError(true);setReady(false);}}
  });
  writer.current=instance;void instance.setCharacter(char).catch(()=>{if(active)setError(true);});
  return ()=>{active=false;generation.current++;controller.abort();instance.dispose(loaded);node.replaceChildren();writer.current=null;};
 },[char,retry]);
 useEffect(()=>{
  const instance=writer.current;if(!instance||!ready)return;
  const colors=dark?{strokeColor:'#d7e5d3',radicalColor:'#b6d19e',outlineColor:'#4c5c50',highlightColor:'#daba80',drawingColor:'#aecf99'}:{strokeColor:'#314c43',radicalColor:'#567657',outlineColor:'#e5e5da',highlightColor:'#d5a55e',drawingColor:'#527c66'};
  for(const [name,color] of Object.entries(colors))void instance.updateColor(name as Parameters<ManagedWriter['updateColor']>[0],color,{duration:0});
 },[dark,ready]);
 async function animate(){const instance=writer.current;if(!instance||!ready)return;const mine=++generation.current;instance.cancelQuiz();setMode('watch');setStatus('跟着笔画，慢慢看。');await instance.animateCharacter({onComplete:result=>{if(!result.canceled&&mine===generation.current){setMode('rest');setStatus('看完啦！也可以一笔一笔看。');callbacks.current.onWatched();}}});}
 async function oneStroke(){const instance=writer.current;if(!instance||!ready)return;const mine=++generation.current;instance.cancelQuiz();setMode('watch');setStatus(`第 ${nextStroke+1} 笔，共 ${count} 笔。`);if(nextStroke===0)await instance.hideCharacter({duration:0});await instance.animateStroke(nextStroke,{onComplete:result=>{if(!result.canceled&&mine===generation.current){setMode('rest');if(nextStroke===count-1)callbacks.current.onWatched();setNextStroke(s=>(s+1)%count);}}});}
 function quiz(){const instance=writer.current;if(!instance||!ready)return;const mine=++generation.current;instance.cancelQuiz();setMode('write');setStatus('从第一笔开始，在田字格里写一写。');void instance.quiz({leniency:1.35,showHintAfterMisses:2,markStrokeCorrectAfterMisses:false,acceptBackwardsStrokes:false,highlightOnComplete:true,
  onMistake:()=>{if(mine===generation.current)setStatus('再试一试：留意起笔的位置和方向。');},
  onCorrectStroke:data=>{if(mine===generation.current&&data.strokesRemaining>0)setStatus(`这一笔写好啦！还有 ${data.strokesRemaining} 笔。`);},
  onComplete:()=>{if(mine===generation.current){setMode('complete');setStatus('写好啦！一笔一画，真认真。');callbacks.current.onWritten();}}
 });}
 return <div className="writing-module"><div className="pad-top"><span>田字格 · 看笔顺，写一写</span><span>{ready?`${count} 画`:'准备中'}</span></div><div className={`writing-grid ${mode==='write'?'writing':''}`}><span className="grid-line horizontal"/><span className="grid-line vertical"/><div ref={host} className="writer-target" role="img" aria-label={`${char}字的笔顺和书写练习`}/></div>
 {error?<div role="alert" className="inline-error">笔顺暂时没有加载成功。<button onClick={()=>setRetry(x=>x+1)}>重新加载</button></div>:<p className="pad-status" role="status">{status}</p>}
 <div className="pad-controls"><button className="outline" onClick={()=>void animate()} disabled={!ready||mode==='watch'}>▷ 看笔顺</button><button className="outline" onClick={()=>void oneStroke()} disabled={!ready||mode==='watch'}>逐笔看</button><button className="primary" onClick={quiz} disabled={!ready||mode==='watch'}>{mode==='complete'?'再写一次':'✎ 我来写'}</button></div>
 {mode==='write'&&<button className="text-button hint" onClick={()=>{void writer.current?.highlightStroke(0);setStatus('先从第一笔开始。写过的笔画会留下来。');}}>提示：第一笔在哪里？</button>}
 {english&&<p className="english-help">Watch the stroke order, or draw with a finger/mouse. Follow the direction of each stroke; hints appear after two tries. Watching is not counted as writing.</p>}
 <p className="pad-note">屏幕练习帮助认识笔顺，握笔和纸上书写请和大人一起练习。</p></div>;
}
