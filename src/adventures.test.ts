import {it,expect} from 'vitest';
import {stories,wordPuzzles,sentencePuzzles} from './adventures';
it('offers eight original graded readings with useful word help and three grounded checks',()=>{
 expect(stories).toHaveLength(8);expect(new Set(stories.map(s=>s.id)).size).toBe(8);
 expect(new Set(stories.map(s=>s.level))).toEqual(new Set([1,2,3]));
 for(const s of stories){expect(s.paragraphs.join('').length).toBeGreaterThan(90);expect(s.questions).toHaveLength(3);expect(s.glossary.length).toBeGreaterThanOrEqual(3);for(const q of s.questions){expect(q.options).toHaveLength(3);expect(new Set(q.options).size).toBe(3);expect(q.options).toContain(q.answer);expect(s.paragraphs.join('')).toContain(q.evidence);}for(const g of s.glossary){expect(s.paragraphs.join('')).toContain(g.word);expect(g.pinyin).toMatch(/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/);}}
});
it('has twelve unambiguous word puzzles and eight sentence puzzles',()=>{
 expect(wordPuzzles).toHaveLength(12);expect(sentencePuzzles).toHaveLength(8);
 for(const p of wordPuzzles){expect(p.prompt).toContain('□');expect(p.options).toContain(p.answer);expect(p.options).toHaveLength(3);expect(p.clue.length).toBeGreaterThan(5);}
 for(const p of sentencePuzzles){expect(p.chunks).toHaveLength(4);expect(new Set(p.chunks).size).toBe(4);expect(p.sentence).toBe(p.chunks.join(''));}
});

it('avoids dictionary variants as wrong choices and keeps clues from spelling an option',()=>{const p=wordPuzzles.find(x=>x.prompt==='想□')!;expect(p.options).not.toContain('像');expect(wordPuzzles.find(x=>x.prompt==='合□')!.options).not.toContain('做');for(const puzzle of wordPuzzles)for(const option of puzzle.options)expect(puzzle.clue).not.toContain(option);});
