const CACHE='private-circle-alpha-0.1.0';
const ASSETS=['./','./index.html','./styles.css','./src/app.js','./src/store.js','./src/secure.js','./src/peer.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(event.request,cp)).catch(()=>{});}return res;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('./')));});
