"""Download only this course's unmodified stroke data and recorded syllables."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import time
import urllib.parse
import urllib.request
ROOT=Path(__file__).resolve().parents[1]
chars=json.loads((ROOT/'src/characters.json').read_text())
repos=['chanind/hanzi-writer-data','hugolpz/audio-cmn','chanind/hanzi-writer']
commits={repo:json.load(urllib.request.urlopen(f'https://api.github.com/repos/{repo}/commits/master',timeout=30))['sha'] for repo in repos}
items=[]
for c in chars:
 items.append((f"strokes/{c['hanzi']}.json",'chanind/hanzi-writer-data',f"data/{c['hanzi']}.json",'Arphic Public License'))
for audio in sorted({c['audio'] for c in chars}):
 items.append((f'audio/{audio}.mp3','hugolpz/audio-cmn',f'64k/syllabs/cmn-{audio}.mp3','CC-BY-SA; upstream version unspecified; Chen Wang'))
items += [('credits/ARPHICPL.TXT','chanind/hanzi-writer-data','ARPHICPL.TXT','Arphic Public License'),('credits/stroke-data-README.md','chanind/hanzi-writer-data','README.md','Provenance'),('credits/HANZI-WRITER-LICENSE.txt','chanind/hanzi-writer','LICENSE','MIT'),('credits/audio-README.md','hugolpz/audio-cmn','README.md','Provenance')]

def fetch(item):
 path,repo,remote,license_name=item
 url=f'https://raw.githubusercontent.com/{repo}/{commits[repo]}/'+urllib.parse.quote(remote)
 for attempt in range(3):
  try:
   data=urllib.request.urlopen(url,timeout=30).read()
   if path.endswith('.json'):
    d=json.loads(data);assert len(d['strokes'])==len(d['medians'])>0
   if path.endswith('.mp3'):assert len(data)>1000
   dest=ROOT/'public'/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
   return {'file':path,'source':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'license':license_name,'modifications':'None'}
  except Exception:
   if attempt==2:raise
   time.sleep(1)
with ThreadPoolExecutor(max_workers=12) as pool:manifest=list(pool.map(fetch,items))
(ROOT/'public/content-manifest.json').write_text(json.dumps({'commits':commits,'audio_author':'Chen Wang','stroke_source':'Hanzi Writer Data / Make Me a Hanzi / Arphic Technology','files':manifest},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'characters':len(chars),'recordings':len({c['audio'] for c in chars}),'files':len(manifest),'bytes':sum(x['bytes'] for x in manifest),'commits':commits}))
