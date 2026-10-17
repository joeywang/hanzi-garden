import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const characters=JSON.parse(fs.readFileSync('src/characters.json','utf8'));
test.beforeEach(async({page})=>{await page.addInitScript(()=>{(window as any).__cspViolations=[];document.addEventListener('securitypolicyviolation',e=>(window as any).__cspViolations.push(`${e.effectiveDirective}: ${e.blockedURI}`));});});
test.afterEach(async({page})=>{expect(await page.evaluate(()=>(window as any).__cspViolations)).toEqual([]);});

test('production lessons play real audio, animate and recognise a written stroke',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('button',{name:/^开始认字/}).click();
 await expect(page.getByRole('button',{name:'▷ 看笔顺'})).toBeEnabled();
 await page.getByRole('button',{name:'听一听',exact:true}).click();
 await expect(page.locator('.lesson-checks')).toContainText('✓ 听过字音');
 await page.getByRole('button',{name:'▷ 看笔顺'}).click();
 await expect(page.locator('.lesson-checks')).toContainText('✓ 看过笔顺');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-garden-v1')!).written)).toEqual([]);
 await page.getByRole('button',{name:'✎ 我来写'}).click();
 const box=(await page.locator('.writer-target').boundingBox())!;
 const data=JSON.parse(fs.readFileSync('public/strokes/一.json','utf8'));
 const scale=(280-44)/1024;
 const median=data.medians[0];
 const coords=median.map(([x,y]:number[])=>({x:box.x+22+x*scale,y:box.y+22+(900-y)*scale}));
 await page.mouse.move(coords[0].x,coords[0].y);await page.mouse.down();
 for(const p of coords.slice(1))await page.mouse.move(p.x,p.y,{steps:5});
 await page.mouse.up();
 await expect(page.locator('.pad-status')).toContainText('写好啦');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-garden-v1')!).written)).toEqual(['一']);
 await page.getByRole('button',{name:/^认识了，下一个/}).click();
 await expect(page.locator('.detail-hanzi')).toHaveText('二');
 await page.reload();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-garden-v1')!).seen)).toEqual(['一']);
 expect(errors).toEqual([]);
});

test('all recorded syllables decode and all character stroke data loads',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/');
 const result=await page.evaluate(async(chars)=>{
 const failures:string[]=[];
 const context=new AudioContext();
 for(const audio of [...new Set(chars.map((c:any)=>c.audio))]){
  await new Promise(resolve=>setTimeout(resolve,250));
  try{const response=await fetch(`/audio/${audio}.mp3`);if(!response.ok)throw Error('HTTP '+response.status);const decoded=await context.decodeAudioData(await response.arrayBuffer());if(decoded.duration<=0)throw Error('empty');}catch(e){failures.push(`${audio}: ${e}`);}
 }
 for(const c of chars){await new Promise(resolve=>setTimeout(resolve,250));const r=await fetch(`/strokes/${encodeURIComponent(c.hanzi)}.json`);if(!r.ok){failures.push(`${c.hanzi}: HTTP ${r.status}`);continue;}const d=await r.json();if(!d.strokes?.length||d.strokes.length!==d.medians.length)failures.push(c.hanzi);}
 await context.close();return failures;
 },characters);
 expect(result).toEqual([]);
});

test('games, search, settings and every main page fit phone, tablet and desktop',async({page})=>{
 await page.goto('/');
 await page.screenshot({path:'screenshots/hanzi-home-desktop.png',fullPage:true});
 for(const width of [360,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const name of ['认字课堂','汉字卡片','识字乐园','成长记录','家长指南 ↗']){
   await page.getByRole('button',{name,exact:true}).click();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} at ${width}`).toBe(true);
  }
  await page.getByRole('button',{name:'汉字卡片',exact:true}).click();
  await page.getByRole('searchbox').fill('鱼');
  await expect(page.locator('.character-card')).toHaveCount(1);
  await page.getByRole('button',{name:'学习 鱼'}).click();
  await expect(page.getByRole('button',{name:'▷ 看笔顺'})).toBeEnabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`lesson at ${width}`).toBe(true);
  await page.getByRole('button',{name:'汉字卡片',exact:true}).click();await page.getByRole('searchbox').fill('');
 }
 await page.getByRole('button',{name:'识字乐园',exact:true}).click();
 await page.getByRole('button',{name:'▦ 认字组词'}).click();await page.getByRole('button',{name:'开始游戏 →'}).click();
 for(let i=0;i<5;i++){
  const char=await page.locator('.word-question .paper-glyph').innerText();
  const choices=page.locator('.game-options button');
  for(const choice of await choices.all())if((await choice.innerText()).includes(char)){await choice.click();break;}
  await page.getByRole('button',{name:i===4?'收下小花 →':'下一题 →'}).click();
 }
 await expect(page.getByRole('heading',{name:'五个小发现，收进花园里！'})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-garden-v1')!).rounds)).toBe(5);
 await page.getByRole('button',{name:'♫ 听音找字'}).click();await page.getByRole('button',{name:'开始游戏 →'}).click();
 await expect(page.locator('.game-options button').first()).toBeDisabled();
 await page.getByRole('button',{name:'播放题目字音'}).click();
 await expect(page.locator('.game-options button').first()).toBeEnabled();
 await page.getByRole('button',{name:'认字课堂',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'screenshots/hanzi-home-mobile.png',fullPage:true});
});

test('missing audio and stroke data offer honest recovery, not fake success',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/audio/**',r=>r.abort());await page.route('**/strokes/**',r=>r.abort());
 await page.goto('/');await page.getByRole('button',{name:/^开始认字/}).click();
 await expect(page.getByRole('button',{name:'重新加载'})).toBeVisible();
 await page.getByRole('button',{name:'听一听',exact:true}).click();
 await expect(page.getByRole('alert').filter({hasText:'声音暂时'})).toBeVisible();
 await expect(page.getByRole('button',{name:/^认识了，下一个/})).toBeDisabled();
 await page.unroute('**/strokes/**');await page.getByRole('button',{name:'重新加载'}).click();
 await expect(page.getByRole('button',{name:'▷ 看笔顺'})).toBeEnabled();
 expect(errors).toEqual([]);
});
