import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const WEB_PUSH_PRIVATE_KEY = "xxx";

function initServiceAccountFromFile() {
  console.log("Loading service account");
  initializeApp({
    projectId: "webpusher-f1968",
    credential: cert("./firebase-adminsdk-sa.json"),
  });
}

type UserDoc = {
  id: string;
};

type UserDevice = {
  id: string;
  token: string;
};

async function start() {
  try {
    initServiceAccountFromFile();
    console.log("Starting");
    const firestore = getFirestore();
    const users = (await firestore.collection("users").get()).docs.map(
      (doc) =>
        ({
          id: doc.id,
        } as UserDoc)
    );

    const messaging = getMessaging();

    console.log({
      users,
    });

    for (const user of users) {
      const devices = (
        await firestore
          .collection("users")
          .doc(user.id)
          .collection("devices")
          .get()
      ).docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as UserDevice)
      );

      const tokens = devices.map((device) => device.token);
      console.log({ tokens });
      const result = await messaging.sendEachForMulticast({
        tokens: tokens,
        notification: {
          title: `Hallo ${Date.now()}`,
          body: "World",
        },
      });
      console.log({ result });
    }
  } catch (error) {
    console.error("Error", error);
  }
}

start();
