
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  "projectId": "energyvison-l60un",
  "appId": "1:493264983763:web:82868beb596aa1887a2626",
  "storageBucket": "energyvison-l60un.appspot.com",
  "apiKey": "AIzaSyCAZWHLnyPDARl0Tlm8fhTXS2asEMUYVr0",
  "authDomain": "energyvison-l60un.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "493264983763",
  "databaseURL": "https://energyvison-l60un-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

export { app, database };
