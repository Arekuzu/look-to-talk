self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open("pwa").then(function(cache) {
			return cache.addAll([
				"/",
				"/img/bootstrap.min.css",
				"/img/ltt.css",
				"/img/ltt.js",
				"./script.js",
			]);
		})
	);
});

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if(response) {
				return response;
			}

			return fetch(event.request).then(function(response) {
				// Clona la respuesta antes de agregarla a la caché
				let responseToCache = response.clone();

				caches.open("pwa").then(function(cache) {
					cache.put(event.request, responseToCache);
				});

				return response;
			});
		})
	);
});
