import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Starting Firestore products listener...');

const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
  console.log(`\n[${new Date().toISOString()}] Snapshot received. Document count: ${snapshot.docs.length}`);
  snapshot.docChanges().forEach((change) => {
    console.log(`  - Type: ${change.type}, ID: ${change.doc.id}, Name: ${change.doc.data().name || 'N/A'}`);
  });
}, (error) => {
  console.error('Error in snapshot listener:', error);
});

// Keep process running
process.stdin.resume();
