import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

console.log("sw.js INIT");

const firebaseConfig = {
  apiKey: "AIzaSyApVG8v4iP5apI_ojXmB2eDIel-gdStiss",
  authDomain: "webpusher-f1968.firebaseapp.com",
  projectId: "webpusher-f1968",
  storageBucket: "webpusher-f1968.appspot.com",
  messagingSenderId: "1084991595562",
  appId: "1:1084991595562:web:745e1108ec4376f09dcf53",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

console.log("messaging", messaging);

onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = "sw" + payload.notification?.title;
  const notificationBody = "sw" + payload.notification?.body;
  const notificationOptions = {
    title: notificationTitle,
    body: notificationBody,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
