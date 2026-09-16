# Dashboard Monitoring Energi Terbarukan

Dashboard HTML untuk GitHub Pages + Firebase Realtime Database, dengan logo Teknologi Rekayasa Elektronika Politeknik Negeri Lampung.

## File

Hanya ada dua file:

```text
index.html
README.md
```

`index.html` sudah berisi HTML, CSS, JavaScript, Chart.js, dan koneksi Firebase dalam satu file.

## Upload ke GitHub

Upload kedua file tersebut langsung ke root repository:

```text
repository/
├── index.html
└── README.md
```

Kemudian:

1. GitHub → **Settings**
2. **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`
5. Folder: `/ (root)`
6. Save

## Firebase

Dashboard menggunakan Firebase Realtime Database.

Di bagian JavaScript dalam `index.html`, isi:

```javascript
const firebaseConfig = {
  apiKey: "ISI_API_KEY_FIREBASE",
  authDomain: "monitoring-energi-terbarukan.firebaseapp.com",
  databaseURL: "ISI_DATABASE_URL_FIREBASE",
  projectId: "monitoring-energi-terbarukan",
  storageBucket: "monitoring-energi-terbarukan.firebasestorage.app",
  messagingSenderId: "ISI_MESSAGING_SENDER_ID",
  appId: "ISI_APP_ID"
};
```

Nilai tersebut diambil dari:

**Firebase Console → Project settings → Your apps → Web app → Config**

Pastikan `databaseURL` adalah URL **Realtime Database**, bukan URL Firestore.

## Struktur Firebase yang digunakan

ESP32 harus mengirim data dengan struktur:

```text
sensor/
└── current/
    ├── temperature
    ├── humidity
    ├── rainfall
    ├── light
    ├── windSpeed
    ├── timestamp
    └── status

history/
└── ID_DATA/
    ├── temperature
    ├── humidity
    ├── rainfall
    ├── light
    ├── windSpeed
    ├── timestamp
    └── status

control/
└── relay/
    ├── state
    ├── mode
    ├── onTime
    ├── offTime
    └── updatedAt
```

## Relay otomatis

Tidak ada relay manual.

Logika:

```text
18:00 → ON
06:00 → OFF
```

Dashboard akan menyimpan status relay pada:

```text
/control/relay
```

Agar lampu tetap mengikuti jadwal ketika browser/GitHub Pages ditutup, **ESP32 juga harus menjalankan jadwal menggunakan NTP/RTC**. Dashboard hanya menjadi tampilan dan sinkronisasi Firebase.

## Penting

Jangan memasukkan password Wi-Fi ESP32 atau password akun Firebase Authentication ke `index.html`.

Firebase Web API key bukan pengganti password. Keamanan akses database harus diatur melalui Firebase Authentication dan Realtime Database Rules.

## Jika dashboard tampil polos

Pastikan `index.html` adalah file yang dibuka GitHub Pages dan bukan file HTML lain. Versi ini sengaja dibuat satu file supaya tidak ada masalah `assets/style.css` atau `assets/app.js` yang tidak ditemukan.


## Navigasi

Sidebar memiliki 4 halaman yang dapat diklik:

- Dashboard
- Grafik
- Histori
- Jadwal Sistem

Logo institusi sudah tertanam langsung di `index.html`, sehingga tidak diperlukan file gambar tambahan.
