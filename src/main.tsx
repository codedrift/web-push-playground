import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function start() {
  const firebaseConfig = {
    apiKey: "AIzaSyApVG8v4iP5apI_ojXmB2eDIel-gdStiss",
    authDomain: "webpusher-f1968.firebaseapp.com",
    projectId: "webpusher-f1968",
    storageBucket: "webpusher-f1968.appspot.com",
    messagingSenderId: "1084991595562",
    appId: "1:1084991595562:web:745e1108ec4376f09dcf53",
  };

  const app = initializeApp(firebaseConfig);
  // Initialize Firebase Cloud Messaging and get a reference to the service
  getMessaging(app);

  // getMessaging(app);

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

start();
