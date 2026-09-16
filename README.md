# Dashboard Monitoring Energi Terbarukan

Dashboard web 4 page untuk monitoring Firebase Realtime Database dengan 5 parameter:

- Suhu
- Kelembapan
- Curah hujan
- Intensitas cahaya
- Kecepatan angin

## Halaman

1. **Dashboard Realtime** — kartu realtime 5 sensor, status koneksi, waktu, histori mini, dan kontrol relay.
2. **Grafik Sensor** — 5 grafik dengan X = waktu dan Y = pembacaan sensor.
3. **Histori Pembacaan** — tabel histori seluruh parameter + export CSV.
4. **Kontrol & Sistem** — jadwal lampu, mode otomatis/manual, dan struktur database.

## Struktur Firebase yang diharapkan

```text
sensor/
  current/
    temperature: 28.5
    humidity: 72
    rainfall: 0
    light: 850
    windSpeed: 2.4
    timestamp: 1778990000000
    status: "OK"

history/
  -AUTO_ID/
    temperature: 28.5
    humidity: 72
    rainfall: 0
    light: 850
    windSpeed: 2.4
    timestamp: 1778990000000
    status: "OK"

control/
  relay/
    state: true
    mode: "auto"
    onTime: "18:00"
    offTime: "06:00"
    updatedAt: 1778990000000
```

> Nama field dapat diubah di `assets/config.js`/`assets/app.js` jika sketch ESP Anda memakai nama berbeda.

## Cara memasang ke GitHub Pages

1. Buat repository baru di GitHub.
2. Upload **semua isi folder ini** ke repository.
3. Edit `assets/config.js` dan masukkan konfigurasi Web App Firebase.
4. Di Firebase Realtime Database, pastikan rules dan autentikasi sesuai kebutuhan.
5. Di GitHub: **Settings → Pages → Deploy from branch → main → /(root)**.
6. Buka URL GitHub Pages yang diberikan GitHub.

### Penting untuk Firebase

Dashboard ini menggunakan Firebase Web SDK melalui CDN. Tidak ada Node.js/build step, sehingga cocok untuk GitHub Pages.

Jika menggunakan Realtime Database dengan akses tanpa login untuk proyek kampus/prototipe, rules harus mengizinkan read/write. Untuk deployment publik, lebih aman gunakan Firebase Authentication dan rules yang membatasi akses.

## Relay: 18:00 ON, 06:00 OFF

Dashboard memiliki dua mode:

- **Otomatis**: dashboard menghitung jadwal dan menulis `state` relay ke `/control/relay`.
- **Manual**: tombol ON/OFF menulis `state` ke `/control/relay`.

Namun, agar relay fisik **pasti** mengikuti jadwal meskipun browser/dashboard sedang ditutup, sketch ESP juga harus membaca `/control/relay` dan menjalankan fallback jadwal lokal 18:00–06:00. Dashboard tidak boleh menjadi satu-satunya pengendali jadwal.

Contoh logika pada ESP:

```cpp
// konsep:
if (relayMode == "manual") {
  digitalWrite(RELAY_PIN, relayState ? RELAY_ON : RELAY_OFF);
} else {
  // gunakan waktu NTP/RTC ESP
  bool lampOn = (jam >= 18 || jam < 6);
  digitalWrite(RELAY_PIN, lampOn ? RELAY_ON : RELAY_OFF);
}
```

Sesuaikan `RELAY_ON`/`RELAY_OFF` dengan modul relay Anda karena sebagian relay bersifat active LOW.

## Jika field ESP Anda berbeda

Misalnya ESP mengirim:

```text
suhu, kelembapan, hujan, cahaya, angin
```

maka ubah pembacaan di `app.js` atau ubah nama field yang dikirim ESP menjadi:

```text
temperature
humidity
rainfall
light
windSpeed
```

## Catatan waktu

Jadwal 18:00–06:00 melewati tengah malam. Dashboard sudah menangani kondisi tersebut. Untuk kontrol fisik yang tetap bekerja tanpa internet/browser, gunakan NTP/RTC di ESP dan timezone Indonesia (WIB = UTC+7) pada perangkat.

