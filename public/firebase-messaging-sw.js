//  * Here is is the code snippet to initialize Firebase Messaging in the Service
//  * Worker when your app is not hosted on Firebase Hosting.

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

console.log("firebase-messaging-sw.js INIT");

firebase.initializeApp({
  apiKey: "AIzaSyApVG8v4iP5apI_ojXmB2eDIel-gdStiss",
  authDomain: "webpusher-f1968.firebaseapp.com",
  projectId: "webpusher-f1968",
  storageBucket: "webpusher-f1968.appspot.com",
  messagingSenderId: "1084991595562",
  appId: "1:1084991595562:web:745e1108ec4376f09dcf53",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = "firebase" + payload.notification?.title;
  const notificationBody = "firebase" + payload.notification?.body;
  const notificationOptions = {
    title: notificationTitle,
    body: notificationBody,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
