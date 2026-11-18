// Offline copy of the app when it is opened from a web address (phone home-screen app).
// Change V whenever the app files change, so phones pick up the new version.
const V='vocab500-9',FILES=['./','index.html','style.css','app.js','data/words.js','data/audio.js','icon.svg','icon-192.png','icon-256.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// network first (so updates show up), the saved copy when offline
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;
e.respondWith(fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin==location.origin){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
