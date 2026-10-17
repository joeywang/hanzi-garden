import {test,expect} from '@playwright/test';
import {stories,wordPuzzles,sentencePuzzles} from '../src/adventures';
for(const story of stories){
 test(`read and understand: ${story.title}`,async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'阅读探险',exact:true}).click();
  await page.getByRole('button',{name:`阅读：${story.title}`}).click();
  await expect(page.getByRole('article',{name:story.title})).toContainText(story.paragraphs[0]);
  expect(await page.evaluate(()=>localStorage.getItem('hanzi-reading-v1'))).toBeNull();
  await page.getByRole('button',{name:`第1题：${story.questions[0].options.find(x=>x!==story.questions[0].answer)}`}).click();
  await expect(page.getByText('再读一读线索，你可以重新选择。')).toBeVisible();
  for(const [i,q] of story.questions.entries())await page.getByRole('button',{name:`第${i+1}题：${q.answer}`}).click();
  await expect(page.getByText('这篇的小问题都完成啦！')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-reading-v1')!))).toEqual([story.id]);
  await page.reload();await page.getByRole('button',{name:'阅读探险',exact:true}).click();
  await expect(page.getByRole('button',{name:`阅读：${story.title}`})).toContainText('已完成小问题');
 });
}
test('complete all word clues and sentence workshops without dragging',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'识字乐园',exact:true}).click();
 await page.getByRole('button',{name:'开始词语侦探'}).click();
 for(const [i,p] of wordPuzzles.entries()){
  await page.getByRole('button',{name:`填字：${p.options.find(x=>x!==p.answer)}`}).click();
  await expect(page.getByRole('button',{name:i===wordPuzzles.length-1?'完成这次挑战':'下一题',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:`填字：${p.answer}`}).click();
  await page.getByRole('button',{name:i===wordPuzzles.length-1?'完成这次挑战':'下一题',exact:true}).click();
 }
 await expect(page.getByText('这次挑战完成啦！')).toBeVisible();
 await page.getByRole('button',{name:'开始句子工坊'}).click();
 for(const [i,p] of sentencePuzzles.entries()){
  if(i===0){for(const chunk of [...p.chunks].reverse())await page.getByRole('button',{name:`句块：${chunk}`}).click();await page.getByRole('button',{name:'检查句子'}).click();await expect(page.getByRole('button',{name:'下一题',exact:true})).toBeDisabled();await page.getByRole('button',{name:'重新排列'}).click();}
  for(const chunk of p.chunks)await page.getByRole('button',{name:`句块：${chunk}`}).click();
  await page.getByRole('button',{name:'检查句子'}).click();await page.getByRole('button',{name:i===sentencePuzzles.length-1?'完成这次挑战':'下一题',exact:true}).click();
 }
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hanzi-word-games-v1')!))).toEqual(['words','sentences']);
});
test('reading filters, text tools, keyboard choices and mobile dark layouts',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'阅读探险',exact:true}).click();
 await page.getByRole('searchbox',{name:'搜索阅读文章'}).fill('机器人');await expect(page.getByRole('button',{name:/^阅读：/})).toHaveCount(1);
 await page.getByRole('searchbox',{name:'搜索阅读文章'}).fill('');
 await page.getByRole('button',{name:'阅读：去月亮的车票'}).click();
 await page.getByRole('button',{name:'大字阅读',exact:true}).click();await expect(page.getByRole('article')).toHaveClass(/large-reading/);
 await page.getByRole('button',{name:'词语拼音 开'}).click();await expect(page.getByText('yín sè',{exact:true})).toHaveCount(0);
 const first=page.getByRole('button',{name:`第1题：${stories[0].questions[0].answer}`});await first.focus();await page.keyboard.press('Enter');await expect(first).toHaveAttribute('aria-pressed','true');
 for(const mode of ['light','dark']){
  await page.getByRole('combobox',{name:'显示主题'}).selectOption(mode);
  for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await page.screenshot({path:`screenshots/reading-${mode}.png`,fullPage:true});
 }
 await page.getByRole('button',{name:'识字乐园',exact:true}).click();await page.getByRole('button',{name:'开始句子工坊'}).click();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'screenshots/word-workshop-mobile-dark.png',fullPage:true});
});

test('a parent reset is reflected by another open reading tab',async({page,context})=>{
 await page.goto('/');await page.getByRole('button',{name:'阅读探险',exact:true}).click();
 const other=await context.newPage();await other.goto('/');await other.evaluate(()=>localStorage.setItem('hanzi-reading-v1','["moon-ticket"]'));
 await expect(page.getByText(/完成阅读小问题：1 \/ 8/)).toBeVisible();
 await other.getByRole('button',{name:'家长指南 ↗',exact:true}).click();other.once('dialog',dialog=>dialog.accept());await other.getByRole('button',{name:'清除本机学习记录',exact:true}).click();
 await expect(page.getByText(/完成阅读小问题：0 \/ 8/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('hanzi-reading-v1'))).toBeNull();await other.close();
});
