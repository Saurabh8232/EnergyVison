
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  "projectId": "energyvison-l60un",
  "appId": "1:493264983763:web:82868beb596aa1887a2d48c",
  "storageBucket": "energyvison-l60un.appspot.com",
  "apiKey": "AIzaSyCAZWHLnyPDARl0Tlm8fhTXS2asEMUYVr0",
  "authDomain": "energyvison-l60un.firebaseapp.com",
  "databaseURL": "https://energyvison-l60un-default-rtdb.asia-southeast1.firebasedatabase.app",
  "messagingSenderId": "493264983763"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const database = getDatabase(app, firebaseConfig.databaseURL);
export default app;
