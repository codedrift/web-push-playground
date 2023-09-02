import { getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import getBrowserFingerprint from "get-browser-fingerprint";
import { useEffect } from "react";
function getDeviceId() {
  const fingerprint = getBrowserFingerprint();
  console.log("fingerprint", fingerprint);
  return fingerprint;
}

async function saveToken(token: string) {
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    return;
  }
  const id = getDeviceId();
  await setDoc(
    doc(firestore, "users", user.uid, "devices", String(id)),
    {
      token: token,
    },
    {
      merge: true,
    }
  );
}

async function initWebPush() {
  console.log("Requesting permission...");
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: "xxx",
      });

      if (token) {
        console.log("got token", { token });
        await saveToken(token);
        console.log("Subscribed to notifications");
      } else {
        // Show permission request UI
        console.log(
          "No registration token available. Request permission to generate one."
        );
        // ...
      }
    }
  } catch (error) {
    console.error("Error subscribing to notification", error);
  }
}

export function useWebPush() {
  useEffect(() => {
    initWebPush();
    const messaging = getMessaging();
    const unsub = onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);

      const notificationTitle = "web" + payload.notification?.title;
      const notificationBody = "web" + payload.notification?.body;
      alert(notificationTitle + " " + notificationBody);
      new Notification(notificationTitle, {
        body: notificationBody,
      });
    });

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []);
}
