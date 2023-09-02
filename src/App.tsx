import {
  GoogleAuthProvider,
  User,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import { useEffect, useState } from "react";
import "./App.css";
import { useWebPush } from "./use-web-push";

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onAuthStateChanged((user) => {
      setUser(user ?? null);
    });
    return () => {
      unsub();
    };
  }, []);

  return {
    user,
  };
}

function LoggedIn() {
  useWebPush();

  const doStuff = () => {
    console.log("do stuff");
    Notification.requestPermission();
  };
  return (
    <div>
      <button onClick={doStuff}>Do stuff</button>
    </div>
  );
}

function LoggedOut() {
  const login = () => {
    const auth = getAuth();
    signInWithPopup(auth, new GoogleAuthProvider());
  };
  return (
    <div>
      <button onClick={login}>login</button>
    </div>
  );
}

function App() {
  const { user } = useAuth();
  if (user) {
    return <LoggedIn />;
  } else {
    return <LoggedOut />;
  }
}

export default App;
