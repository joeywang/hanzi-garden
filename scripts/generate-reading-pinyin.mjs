// Build-time generation only: the browser receives static annotations, not the full dictionary.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {pinyin} from 'pinyin-pro';
import {stories} from '../src/adventures.ts';

const overrides={
 '慢慢地':'màn màn de','安静地':'ān jìng de','轻轻地':'qīng qīng de',
 '系好':'jì hǎo','还书':'huán shū','长高':'zhǎng gāo','长大':'zhǎng dà','长长':'cháng cháng',
 '藏在':'cáng zài','躲藏':'duǒ cáng','觉得':'jué de','得多':'de duō',
 '只想':'zhǐ xiǎng','只有':'zhǐ yǒu','只重复':'zhǐ chóng fù','只画下':'zhǐ huà xià',
 '一页一页地':'yí yè yí yè de','扫得':'sǎo de','兴奋地':'xīng fèn de','还愿意':'hái yuàn yì',
};
function annotate(text){
 const tokens=pinyin(text,{type:'all'}).map(item=>({text:item.origin,pinyin:item.isZh?item.pinyin:''}));
 if(tokens.map(t=>t.text).join('')!==text||tokens.length!==[...text].length)throw Error('Annotation alignment changed: '+text);
 for(const [phrase,reading] of Object.entries(overrides)){
  let offset=text.indexOf(phrase);
  while(offset!==-1){const start=[...text.slice(0,offset)].length;const syllables=reading.split(' ');if(syllables.length!==[...phrase].length)throw Error('Invalid phrase override: '+phrase);syllables.forEach((value,i)=>tokens[start+i].pinyin=value);offset=text.indexOf(phrase,offset+phrase.length);}
 }
 return tokens;
}
const source=stories.map(({id,title,paragraphs})=>({id,title,paragraphs}));
const version=JSON.parse(readFileSync(new URL('../node_modules/pinyin-pro/package.json',import.meta.url),'utf8')).version;
const result={generator:{name:'pinyin-pro',version,license:'MIT'},sourceHash:createHash('sha256').update(JSON.stringify(source)).digest('hex'),overrides,stories:Object.fromEntries(stories.map(s=>[s.id,{title:annotate(s.title),paragraphs:s.paragraphs.map(annotate)}]))};
writeFileSync(new URL('../src/reading-pinyin.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({stories:stories.length,annotatedCharacters:Object.values(result.stories).flatMap(s=>[...s.title,...s.paragraphs.flat()]).filter(t=>t.pinyin).length,generator:result.generator}));
