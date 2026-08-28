// ============================================================
//  Firebase Configuration — Spice Route Restaurant
//  Replace placeholder values with your Firebase project config
//  Steps: console.firebase.google.com > Add project > Web app > Copy config
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCyN2tfxI8Qx1Nc7gHQ4NzE7s9RdpjkQHo",
  authDomain: "spice-route-de1cb.firebaseapp.com",
  projectId: "spice-route-de1cb",
  storageBucket: "spice-route-de1cb.firebasestorage.app",
  messagingSenderId: "34148446542",
  appId: "1:34148446542:web:a792deed5930a1820bae1f",
  measurementId: "G-FXT52FTS8K"
};

let db = null;
let auth = null;
let ordersCol = null;
let reservationsCol = null;
let contactsCol = null;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (firebase.firestore) {
      db = firebase.firestore();
      ordersCol       = db.collection("orders");
      reservationsCol = db.collection("reservations");
      contactsCol     = db.collection("contacts");
    }
    if (firebase.auth) {
      auth = firebase.auth();
    }
  }
} catch (e) {
  console.log("Firebase initialized in local/offline mode:", e.message);
}
