import { initializeApp } from "firebase/app";
try {
  initializeApp({ apiKey: undefined });
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
