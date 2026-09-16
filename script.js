const firebaseConfig = {
    apiKey: "API_KEY_KAMU",
    authDomain: "PROJECT_ID.firebaseapp.com",
    databaseURL: "https://PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let charts = {};
let modalChartInstance = null;
let historyData = [];

window.switchPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById(`nav-${pageId}`).classList.add('active');
}

setInterval(() => {
    const now = new Date();
    document.getElementById('waktu-sekarang').innerText = now.toLocaleString('id-ID');
}, 1000);

const connectedRef = db.ref(".info/connected");
connectedRef.on("value", (snap) => {
    const statusEl = document.getElementById("status-koneksi");
    if (snap.val() === true) {
        statusEl.innerText = "Online";
        statusEl.className = "online";
    } else {
        statusEl.innerText = "Offline";
        statusEl.className = "offline";
    }
});

db.ref("sensor_realtime").on("value", (snapshot) => {
    const data = snapshot.val();
    if(data) {
        document.getElementById("rt-suhu").innerText = `${data.suhu} °C`;
        document.getElementById("rt-kelembapan").innerText = `${data.kelembapan} %`;
        document.getElementById("rt-hujan").innerText = `${data.hujan} mm`;
        document.getElementById("rt-cahaya").innerText = `${data.cahaya} lx`;
        document.getElementById("rt-angin").innerText = `${data.angin} m/s`;
    }
});

const toggleLampu = document.getElementById("toggle-lampu");
db.ref("kontrol").on("value", (snapshot) => {
    const data = snapshot.val();
    if(data) {
        toggleLampu.checked = data.lampu;
        document.getElementById("set-on").value = data.waktu_on || "";
        document.getElementById("set-off").value = data.waktu_off || "";
    }
});

toggleLampu.addEventListener('change', (e) => {
    db.ref("kontrol").update({ lampu: e.target.checked });
});

window.simpanJadwal = function() {
    const onTime = document.getElementById("set-on").value;
    const offTime = document.getElementById("set-off").value;
    db.ref("kontrol").update({
        waktu_on: onTime,
        waktu_off: offTime
    }).then(() => alert("Jadwal lampu berhasil disimpan!"));
}

db.ref("history").orderByChild("timestamp").limitToLast(50).on("value", (snapshot) => {
    const tbody = document.querySelector("#history-table tbody");
    tbody.innerHTML = "";
    historyData = [];
    
    let labels = [];
    let datasets = {
        suhu: [], kelembapan: [], hujan: [], cahaya: [], angin: []
    };

    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        historyData.push(data);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.timestamp}</td>
            <td>${data.suhu}</td>
            <td>${data.kelembapan}</td>
            <td>${data.hujan}</td>
            <td>${data.cahaya}</td>
            <td>${data.angin}</td>
        `;
        tbody.prepend(tr);

        labels.push(data.timestamp.split(" ")[1]);
        datasets.suhu.push(data.suhu);
        datasets.kelembapan.push(data.kelembapan);
        datasets.hujan.push(data.hujan);
        datasets.cahaya.push(data.cahaya);
        datasets.angin.push(data.angin);
    });

    updateCharts(labels, datasets);
});

function initChart(ctxId, label, color) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

charts.suhu = initChart('chart-suhu', 'Suhu (°C)', '#e74c3c');
charts.kelembapan = initChart('chart-kelembapan', 'Kelembapan (%)', '#3498db');
charts.hujan = initChart('chart-hujan', 'Curah Hujan (mm)', '#9b59b6');
charts.cahaya = initChart('chart-cahaya', 'Intensitas Cahaya (lx)', '#f1c40f');
charts.angin = initChart('chart-angin', 'Kecepatan Angin (m/s)', '#2ecc71');

function updateCharts(labels, datasets) {
    Object.keys(charts).forEach(key => {
        charts[key].data.labels = labels;
        charts[key].data.datasets[0].data = datasets[key];
        charts[key].update();
    });
}

window.openDetail = function(param) {
    document.getElementById("detail-modal").style.display = "block";
    document.getElementById("modal-title").innerText = `Detail Histori: ${param.toUpperCase()}`;
    
    let labels = historyData.map(d => d.timestamp.split(" ")[1]);
    let dataValues = historyData.map(d => d[param]);

    const ctx = document.getElementById("modal-chart").getContext("2d");
    if(modalChartInstance) modalChartInstance.destroy();
    
    modalChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: param, data: dataValues, borderColor: '#34495e', fill: true, backgroundColor: 'rgba(52, 73, 94, 0.2)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

window.closeDetail = function() {
    document.getElementById("detail-modal").style.display = "none";
}
