importScripts('workbox-v3.1.0/Workbox-sw.js');

self.workbox.skipWaiting();
self.workbox.clientsClaim();

self.workbox.routing.registerRoute(
  'https://hacker-news.firebaseio.com/v0',
  new workbox.strategies.NetworkFirst()
);

self.workbox.precaching.precacheAndRoute([]);