// Offline copy of the app when it is opened from a web address (phone home-screen app).
// Change V whenever the app files change, so phones pick up the new version.
const V='vocab500-10',FILES=['./','index.html','style.css','app.js','data/words.js','data/audio.js','icon.svg','icon-192.png','icon-256.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

// Pronunciations: kept whole in the cache, and a player that asks for part of the file ("Range", which Safari on
// iPhone always does) gets exactly that part. Passing such requests straight through left phones silent.
async function sound(req){
  const c=await caches.open(V),url=req.url.split('#')[0];
  let full=await c.match(url);
  if(!full){
    let r;try{r=await fetch(url)}catch(e){return Response.error()}
    if(r.status!=200)return r;
    await c.put(url,r.clone());full=r;
  }
  const buf=await full.arrayBuffer(),size=buf.byteLength,range=req.headers.get('range');
  const head={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes'};
  if(!range)return new Response(buf,{status:200,headers:{...head,'Content-Length':String(size)}});
  const m=/bytes=(\d*)-(\d*)/.exec(range)||[];
  let a=m[1]?+m[1]:0,z=m[2]?Math.min(+m[2],size-1):size-1;
  if(!m[1]&&m[2]){a=Math.max(0,size-+m[2]);z=size-1}   // "bytes=-500": the last 500 bytes
  if(a>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  return new Response(buf.slice(a,z+1),{status:206,headers:{...head,'Content-Range':`bytes ${a}-${z}/${size}`,'Content-Length':String(z-a+1)}});
}

// everything else: network first (so updates show up), the saved copy when offline
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;
const u=new URL(e.request.url);
if(u.origin==location.origin&&u.pathname.endsWith('.mp3')){e.respondWith(sound(e.request));return}
e.respondWith(fetch(e.request).then(r=>{if(r.status==200&&u.origin==location.origin){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
