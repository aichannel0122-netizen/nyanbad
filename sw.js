var CACHE = 'nyanbad-v2';
var FILES = [
  './index.html',
  './manifest.json',
  './img/court_a.png',
  './img/court_b.png',
  './img/court_c.png',
  './img/court_d.png',
  './img/face.png',
  './img/free.png',
  './img/good.png',
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
           .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // localStorageのデータはブラウザ側で管理されるため影響なし
  e.respondWith(
    caches.match(e.request).then(function(cached){
      // ネットワークを優先して最新版を取得、失敗時はキャッシュを使う
      return fetch(e.request).then(function(response){
        // 成功したらキャッシュを更新
        var responseClone = response.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, responseClone);
        });
        return response;
      }).catch(function(){
        return cached || caches.match('./index.html');
      });
    })
  );
});
