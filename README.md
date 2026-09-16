# IoT Monitoring Dashboard

Dashboard berbasis web untuk monitoring parameter lingkungan (Suhu, Kelembapan, Curah Hujan, Intensitas Cahaya, dan Kecepatan Angin) secara real-time dan histori menggunakan **Firebase Realtime Database** dan **Chart.js**.

## File di dalam Proyek Ini
- `index.html` : Kerangka antarmuka pengguna (UI) dashboard.
- `style.css` : Styling untuk memberikan tampilan modern dan responsif.
- `script.js` : Logika untuk mengambil data dari Firebase, memperbarui grafik, dan mengendalikan navigasi.
- `README.md` : Panduan penggunaan.

## Cara Penggunaan
1. Ekstrak file ZIP ini.
2. Buka file `script.js` menggunakan text editor (contoh: VS Code atau Notepad).
3. Cari bagian `firebaseConfig` di baris paling atas, lalu ubah nilainya sesuai dengan kredensial project Firebase kamu.
   ```javascript
   const firebaseConfig = {
       apiKey: "API_KEY_KAMU",
       authDomain: "PROJECT_ID.firebaseapp.com",
       databaseURL: "https://PROJECT_ID-default-rtdb.firebaseio.com",
       projectId: "PROJECT_ID",
       storageBucket: "PROJECT_ID.appspot.com",
       messagingSenderId: "SENDER_ID",
       appId: "APP_ID"
   };
   ```
4. Simpan perubahan.
5. Buka file `index.html` di browser (Chrome/Firefox/Edge) untuk melihat dan mencoba dashboard.

## Deploy ke GitHub Pages
Karena proyek ini berbasis HTML, CSS, dan JS murni (tanpa backend server), file ini sangat ideal untuk langsung dihosting secara gratis di GitHub Pages.
1. Buat repository baru di akun GitHub kamu.
2. Upload file `index.html`, `style.css`, dan `script.js` ke dalam repository tersebut.
3. Masuk ke **Settings** > **Pages** di menu repository GitHub.
4. Pada bagian *Source*, pilih branch `main` atau `master`, lalu klik **Save**.
5. Tunggu beberapa menit, website dashboard-mu akan online dan dapat diakses dari mana saja.

## Struktur Database Firebase yang Dibutuhkan
Pastikan data yang dikirimkan dari mikrokontroler (misalnya ESP32) ke Firebase terstruktur seperti ini:
```json
{
  "sensor_realtime": {
    "suhu": 0,
    "kelembapan": 0,
    "hujan": 0,
    "cahaya": 0,
    "angin": 0
  },
  "kontrol": {
    "lampu": false,
    "waktu_on": "18:00",
    "waktu_off": "06:00"
  },
  "history": {
    "unique_id_1": {
      "timestamp": "2026-09-13 14:00:00",
      "suhu": 28.5,
      "kelembapan": 60,
      "hujan": 0,
      "cahaya": 150,
      "angin": 5.2
    }
  }
}
```
