import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getDatabase, ref, onValue, set, update
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { firebaseConfig, paths, appSettings } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PARAMS = {
  temperature: {label:"Suhu", unit:"°C"},
  humidity: {label:"Kelembapan", unit:"%"},
  rainfall: {label:"Curah Hujan", unit:"mm"},
  light: {label:"Intensitas Cahaya", unit:"lux"},
  windSpeed: {label:"Kecepatan Angin", unit:"m/s"}
};

let historyData = [];
let charts = {};
let miniCharts = {};
let relayData = {state:false, mode:"auto", onTime:appSettings.defaultOnTime, offTime:appSettings.defaultOffTime};

const $ = id => document.getElementById(id);
const num = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function showToast(message) {
  const t = $("toast"); t.textContent = message; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2600);
}

function setConnection(online) {
  $("connectionDot").className = "dot " + (online ? "online" : "offline");
  $("headerDot").className = "dot " + (online ? "online" : "offline");
  $("connectionText").textContent = online ? "Firebase Online" : "Firebase Offline";
  $("headerStatus").textContent = online ? "Online" : "Offline";
  $("firebaseStatus").textContent = online ? "Terhubung" : "Terputus";
  $("firebaseStatus").className = online ? "green-text" : "red-text";
}

function formatTime(ts) {
  if (ts === undefined || ts === null || ts === "") return "-";
  let d;
  if (typeof ts === "number") d = new Date(ts < 1e12 ? ts*1000 : ts);
  else d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString("id-ID", {hour:"2-digit",minute:"2-digit",second:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"});
}

function normalizeHistory(raw) {
  if (!raw) return [];
  const arr = Object.entries(raw).map(([id,v])=>({...v, id}));
  return arr.sort((a,b)=>getTimestamp(a)-getTimestamp(b)).slice(-appSettings.maxHistory);
}
function getTimestamp(v) {
  if (typeof v.timestamp === "number") return v.timestamp;
  const parsed = Date.parse(v.timestamp || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function updateCurrent(data) {
  if (!data) return;
  for (const p of Object.keys(PARAMS)) {
    const value = num(data[p]);
    $(p).textContent = value === null ? "--" : value.toLocaleString("id-ID");
  }
  $("lastUpdate").textContent = formatTime(data.timestamp);
  $("syncTime").textContent = formatTime(data.timestamp);
  $("deviceStatus").textContent = data.status || "Data diterima";
  $("deviceStatus").className = "green-text";
  for (const p of Object.keys(PARAMS)) drawMini(p);
}

function getSeries(p) {
  return historyData.map(x=>({x:getTimestamp(x), y:num(x[p])})).filter(x=>x.y!==null);
}

function drawMini(p) {
  const el = $("mini-"+p); if (!el) return;
  const series = getSeries(p).slice(-20);
  if (miniCharts[p]) miniCharts[p].destroy();
  miniCharts[p] = new Chart(el, {
    type:"line", data:{labels:series.map(x=>x.x),datasets:[{data:series.map(x=>x.y),borderWidth:2,pointRadius:0,tension:.35,fill:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}}
  });
}

function buildCharts() {
  for (const p of Object.keys(PARAMS)) {
    const el = $("chart-"+p); if (!el) continue;
    const series = getSeries(p);
    if (charts[p]) charts[p].destroy();
    charts[p] = new Chart(el, {
      type:"line",
      data:{labels:series.map(x=>x.x),datasets:[{
        label:`${PARAMS[p].label} (${PARAMS[p].unit})`,
        data:series.map(x=>x.y), borderWidth:2, pointRadius:2, tension:.25, fill:false
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{mode:"index",intersect:false},
        scales:{
          x:{type:"linear",ticks:{callback:v=>new Date(v).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})},title:{display:true,text:"Waktu"}},
          y:{title:{display:true,text:`Pembacaan (${PARAMS[p].unit})`}}
        },
        plugins:{legend:{display:true},tooltip:{callbacks:{title:items=>new Date(items[0].parsed.x).toLocaleString("id-ID")}}}
      }
    });
  }
}

function renderTable() {
  const body = $("historyBody");
  const rows = [...historyData].reverse();
  if (!rows.length) { body.innerHTML = '<tr><td colspan="7" class="empty">Belum ada data histori.</td></tr>'; return; }
  body.innerHTML = rows.map(x=>`
    <tr>
      <td>${formatTime(x.timestamp)}</td>
      <td>${num(x.temperature) ?? "-"}</td>
      <td>${num(x.humidity) ?? "-"}</td>
      <td>${num(x.rainfall) ?? "-"}</td>
      <td>${num(x.light) ?? "-"}</td>
      <td>${num(x.windSpeed) ?? "-"}</td>
      <td><span class="table-status">${x.status || "OK"}</span></td>
    </tr>`).join("");
}

function setRelayUI() {
  const on = !!relayData.state;
  $("relayState").textContent = on ? "NYALA" : "MATI";
  $("relayState").className = "state-pill " + (on ? "on" : "off");
  $("relayText").textContent = on ? "Lampu menyala" : "Lampu mati";
  $("relayScheduleText").textContent =
    `Otomatis: NYALA ${relayData.onTime} • MATI ${relayData.offTime}`;
}

async function syncAutoRelay() {
  const desired = inSchedule(relayData.onTime, relayData.offTime);
  if (!!relayData.state !== desired || relayData.mode !== "auto") {
    relayData.state = desired;
    relayData.mode = "auto";
    setRelayUI();
    try {
      await update(ref(db, paths.relay), {
        state: desired,
        mode: "auto",
        onTime: relayData.onTime,
        offTime: relayData.offTime,
        updatedAt: Date.now()
      });
    } catch(e) {
      showToast("Gagal sinkron relay: " + e.message);
    }
  }
}

function setupNavigation() {
  const titles = {dashboard:"Dashboard Realtime", grafik:"Grafik Sensor", histori:"Histori Pembacaan", kontrol:"Kontrol & Sistem"};
  function navigate() {
    const page = location.hash.replace("#","") || "dashboard";
    document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
    $("page-"+(titles[page] ? page : "dashboard")).classList.add("active");
    document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active", x.dataset.page===(titles[page]?page:"dashboard")));
    $("pageTitle").textContent = titles[page] || titles.dashboard;
    if (page==="grafik") setTimeout(buildCharts,30);
  }
  window.addEventListener("hashchange", navigate); navigate();
  document.querySelectorAll(".sensor-card.clickable").forEach(card=>{
    card.addEventListener("click",()=>{ location.hash="grafik"; setTimeout(buildCharts,50); });
  });
}

function exportCSV() {
  const header=["Waktu","Suhu (°C)","Kelembapan (%)","Curah Hujan (mm)","Cahaya (lux)","Angin (m/s)","Status"];
  const lines=[header,...historyData.map(x=>[formatTime(x.timestamp),x.temperature??"",x.humidity??"",x.rainfall??"",x.light??"",x.windSpeed??"",x.status??"OK"])]
    .map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([lines],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="histori-sensor.csv"; a.click();
}

function startClock() {
  const tick=()=>{
    const d=new Date();
    $("clock").textContent=d.toLocaleTimeString("id-ID");
    $("dateNow").textContent=d.toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  };
  tick(); setInterval(tick,1000);
}

function init() {
  setupNavigation(); startClock();
  $("onTime").value=appSettings.defaultOnTime; $("offTime").value=appSettings.defaultOffTime;
  $("saveSchedule").addEventListener("click", async()=>{
    relayData.onTime=$("onTime").value; relayData.offTime=$("offTime").value;
    try { await update(ref(db,paths.relay),{onTime:relayData.onTime,offTime:relayData.offTime,updatedAt:Date.now()}); showToast("Jadwal tersimpan."); syncAutoRelay(); }
    catch(e){showToast("Gagal menyimpan jadwal: "+e.message);}
  });
  $("exportCsv").addEventListener("click",exportCSV);

  // Realtime connection state
  onValue(ref(db,".info/connected"), snap=>setConnection(snap.val()===true));

  onValue(ref(db,paths.current), snap=>updateCurrent(snap.val()), err=>showToast("Gagal membaca sensor: "+err.message));
  onValue(ref(db,paths.history), snap=>{
    historyData=normalizeHistory(snap.val());
    renderTable();
    Object.keys(PARAMS).forEach(drawMini);
    if (location.hash==="#grafik") buildCharts();
  });
  onValue(ref(db,paths.relay), snap=>{
    const d=snap.val();
    if (d) relayData={...relayData,...d};
    setRelayUI();
    $("onTime").value=relayData.onTime||appSettings.defaultOnTime;
    $("offTime").value=relayData.offTime||appSettings.defaultOffTime;
  });
  setInterval(syncAutoRelay,10000);
}
init();
