// Blocking, same-origin bootstrap: select colour scheme before CSS or React paints.
(()=>{let value='system';try{value=localStorage.getItem('hanzi-garden-theme-v1')||'system';}catch{}document.documentElement.dataset.theme=value==='light'||value==='dark'?value:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';})();
