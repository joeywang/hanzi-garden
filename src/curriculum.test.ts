import {describe,it,expect} from 'vitest';
import {characters,themes,optionsFor,matchWord} from './curriculum';
describe('starter curriculum',()=>{
 it('contains 48 unique characters, each in one of 8 six-character lessons',()=>{
  expect(characters).toHaveLength(48);expect(new Set(characters.map(c=>c.hanzi)).size).toBe(48);
  expect(themes).toHaveLength(8);expect(themes.flatMap(t=>t.chars).sort()).toEqual(characters.map(c=>c.hanzi).sort());
 });
 it('has valid pinyin, contextual words and original sentences',()=>{
  for(const c of characters){expect(c.audio).toMatch(/^[a-zv]+[1-4]$/);expect(c.words).toHaveLength(2);for(const w of c.words)expect(w).toContain(c.hanzi);expect(c.sentence).toContain(c.hanzi);expect(c.meaning.length).toBeGreaterThan(0);}
 });
 it('makes four unique character choices containing the target, without losing it when ordering changes',()=>{
  for(const c of characters){const options=optionsFor(c.hanzi,characters.map(x=>x.hanzi));expect(options).toHaveLength(4);expect(new Set(options).size).toBe(4);expect(options).toContain(c.hanzi);}
 });
 it('builds a contextual fill-in-the-word prompt',()=>{expect(matchWord(characters[0])).toEqual({prompt:'□个',answer:'一'});});
});