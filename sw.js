/* Wallet Klub — service worker opcional.
   Úsalo solo si alojas la app en una dirección https: sube este archivo junto al HTML
   (en la misma carpeta; conviene renombrar el HTML a index.html). Permite abrirla sin conexión. */
const CACHE = 'wallet-klub-v1';

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.add(self.registration.scope)).catch(()=>{}));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k !== CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Red primero (así las actualizaciones llegan siempre) y caché como respaldo sin conexión
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
      return res;
    }).catch(()=>caches.match(req).then(r=> r || caches.match(self.registration.scope)))
  );
});
