import { initializeApp } from "firebase/app";
try {
  console.log("Before init");
  const app = initializeApp({ projectId: undefined });
  console.log("After init", app.name);
} catch (e) {
  console.log("Caught:", e.message);
}
