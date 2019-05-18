importScripts('workbox-v3.4.1/Workbox-sw.js');

// Enable to see workbox dev messages
// self.workbox.setConfig({
//   debug: true
// });

self.workbox.skipWaiting();
self.workbox.clientsClaim();

/**
 * Cache all firebase requests
 */
self.workbox.routing.registerRoute(
  /^https:\/\/hacker-news\.firebaseio\.com\/v0/,
  new workbox.strategies.NetworkFirst()
);

self.workbox.precaching.precacheAndRoute([]);