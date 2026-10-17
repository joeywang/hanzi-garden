import {it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {stories} from './adventures';
import data from './reading-pinyin.json';
type Token={text:string;pinyin:string};
const annotations:Record<string,{title:Token[];paragraphs:Token[][]}>=data.stories;
it('preserves every title, paragraph and punctuation with one annotation per Han character',()=>{
 expect(Object.keys(annotations).sort()).toEqual(stories.map(s=>s.id).sort());
 for(const story of stories){const entry=annotations[story.id];expect(entry.paragraphs).toHaveLength(story.paragraphs.length);for(const [tokens,text] of [[entry.title,story.title],...entry.paragraphs.map((line,i)=>[line,story.paragraphs[i]])] as [Token[],string][]){expect(tokens.map(t=>t.text).join('')).toBe(text);for(const token of tokens){expect([...token.text]).toHaveLength(1);if(/\p{Script=Han}/u.test(token.text))expect(token.pinyin).toMatch(/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜêńňǹḿ]+$/u);else expect(token.pinyin).toBe('');}}}
});
it('fails when story copy changes without regenerating its static annotations',()=>{
 const source=stories.map(({id,title,paragraphs})=>({id,title,paragraphs}));expect(data.sourceHash).toBe(createHash('sha256').update(JSON.stringify(source)).digest('hex'));expect(data.generator.version).toBe('3.29.5');
});
it('uses contextual readings instead of blindly applying first dictionary readings',()=>{
 const cases=[['还书','huán shū'],['系好','jì hǎo'],['长高','zhǎng gāo'],['长大','zhǎng dà'],['安静地','ān jìng de'],['兴奋地','xīng fèn de'],['一页一页地','yí yè yí yè de'],['扫得','sǎo de'],['只想','zhǐ xiǎng'],['只画下','zhǐ huà xià'],['只重复','zhǐ chóng fù'],['还愿意','hái yuàn yì'],['地面','dì miàn'],['一只','yì zhī']];
 for(const [phrase,reading] of cases){let found=0;for(const story of stories)for(const [i,text] of story.paragraphs.entries()){let offset=text.indexOf(phrase);while(offset!==-1){const start=[...text.slice(0,offset)].length;expect(annotations[story.id].paragraphs[i].slice(start,start+[...phrase].length).map(t=>t.pinyin).join(' '),phrase).toBe(reading);found++;offset=text.indexOf(phrase,offset+phrase.length);}}expect(found,phrase).toBeGreaterThan(0);}
});
