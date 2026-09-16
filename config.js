// ============================================================
// KONFIGURASI FIREBASE
// Ganti nilai di bawah dengan konfigurasi project Firebase Anda.
// Firebase Console -> Project settings -> Your apps -> Web app
// ============================================================

export const firebaseConfig = {
  apiKey: "GANTI_API_KEY",
  authDomain: "GANTI_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://GANTI_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "GANTI_PROJECT_ID",
  storageBucket: "GANTI_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "GANTI_MESSAGING_SENDER_ID",
  appId: "GANTI_APP_ID"
};

// Path utama. Jika sketch ESP Anda memakai nama field berbeda,
// ubah bagian ini tanpa perlu mengubah app.js.
export const paths = {
  current: "sensor/current",
  history: "history",
  relay: "control/relay"
};

export const appSettings = {
  maxHistory: 100,
  timezoneLabel: "WIB",
  // Default jadwal lampu: ON 18:00, OFF 06:00
  defaultOnTime: "18:00",
  defaultOffTime: "06:00"
};
