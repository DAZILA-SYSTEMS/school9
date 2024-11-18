self.addEventListener("push", (event) => {
	const data = event.data.json();
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: "/logo192.jpg",
		})
	);
});

const CACHE_NAME = "dynamic-cache-v1";

self.addEventListener("install", (event) => {
	console.log(event);
	self.skipWaiting(); // Activate the service worker immediately after installation
});

self.addEventListener("fetch", (event) => {
	const requestURL = new URL(event.request.url);

	// Cache specific extensions dynamically
	const extensionsToCache = [
		".js",
		".css",
		".png",
		".jpg",
		".svg",
		".woff2",
		".json",
	];

	if (extensionsToCache.some((ext) => requestURL.pathname.endsWith(ext))) {
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return fetch(event.request).then((networkResponse) => {
					return caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					});
				});
			})
		);
	} else {
		// Fallback to network for other requests
		event.respondWith(fetch(event.request));
	}
});

self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) =>
			Promise.all(
				cacheNames.map((cacheName) => {
					if (!cacheWhitelist.includes(cacheName)) {
						return caches.delete(cacheName);
					}
				})
			)
		)
	);
});
