/**
 * NIKTO System Monitor — dashboard.js
 * Polls /api/snapshot every POLL_MS milliseconds and updates the DOM.
 * No frameworks. No build step.
 */

'use strict';

const POLL_MS      = 2000;   // refresh interval
const HISTORY_LEN  = 60;     // CPU history samples (= 60 × 2s = 2 min)

// ── State ─────────────────────────────────────────────────────────────────
let sortBy         = 'cpu';
let cpuHistory     = new Array(HISTORY_LEN).fill(0);
let cpuCanvas      = null;
let cpuCtx         = null;
let firstLoadDone  = false;   // tracks whether the overlay has been removed

// ── DOM helpers ───────────────────────────────────────────────────────────
const el = id => document.getElementById(id);

function setBar(barId, pct) {
  const bar = el(barId);
  if (!bar) return;
  const safe = Math.min(100, Math.max(0, pct));
  bar.style.width = safe + '%';
  bar.className = 'bar-fill' +
    (safe >= 90 ? ' crit' : safe >= 70 ? ' warn' : '');
}

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text;
}

// ── Main render ───────────────────────────────────────────────────────────
function render(data) {
  renderHeader(data.system);
  renderCPU(data.cpu, data.system);
  renderMemory(data.memory);
  renderDisk(data.disk);
  renderNetwork(data.network);
  renderProcesses(data.processes);
}

// ── Header ────────────────────────────────────────────────────────────────
function renderHeader(sys) {
  setText('hostname', sys.hostname);
  setText('os-name',  sys.os_name);
  setText('uptime',   '↑ ' + sys.uptime.human);
}

// ── CPU ───────────────────────────────────────────────────────────────────
function renderCPU(cpu, sys) {
  const pct = cpu.percent;
  setText('cpu-percent', pct.toFixed(1) + '%');
  setText('cpu-freq',
    cpu.freq_mhz ? `${cpu.freq_mhz} MHz / ${cpu.freq_max_mhz} MHz` : '—');
  setBar('bar-cpu', pct);

  // Temperature
  if (cpu.temperature && cpu.temperature.current != null) {
    const t = cpu.temperature.current;
    setText('cpu-temp', t + '°C');
    setText('cpu-temp-src', cpu.temperature.source || 'sensor');
    const maxT = cpu.temperature.critical || 100;
    setBar('bar-temp', (t / maxT) * 100);
  } else {
    setText('cpu-temp', 'N/A');
    setText('cpu-temp-src', 'no sensor');
  }

  // Load average
  const [l1, l5, l15] = cpu.load_avg;
  setText('load-1',     l1.toFixed(2));
  setText('load-detail', `5m: ${l5.toFixed(2)}  15m: ${l15.toFixed(2)}`);
  const cores = cpu.count_logical || 1;
  setBar('bar-load', (l1 / cores) * 100);

  // CPU model
  setText('cpu-model', sys.cpu_model || '');

  // Per-core bars
  const coreContainer = el('cpu-cores');
  if (coreContainer && cpu.per_core) {
    const items = cpu.per_core.map((p, i) => `
      <div class="core-item">
        <div class="core-label">
          <span>Core ${i}</span>
          <span>${p.toFixed(0)}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${p >= 90 ? 'crit' : p >= 70 ? 'warn' : ''}"
               style="width:${p}%"></div>
        </div>
      </div>`).join('');
    coreContainer.innerHTML = items;
  }

  // History chart
  cpuHistory.push(pct);
  if (cpuHistory.length > HISTORY_LEN) cpuHistory.shift();
  drawCpuChart();
}

// ── CPU canvas chart ──────────────────────────────────────────────────────
function initCanvas() {
  cpuCanvas = el('cpu-chart');
  if (!cpuCanvas) return;
  cpuCtx = cpuCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!cpuCanvas) return;
  cpuCanvas.width  = cpuCanvas.offsetWidth  * window.devicePixelRatio;
  cpuCanvas.height = cpuCanvas.offsetHeight * window.devicePixelRatio;
  drawCpuChart();
}

function drawCpuChart() {
  if (!cpuCtx || !cpuCanvas) return;
  const w  = cpuCanvas.width;
  const h  = cpuCanvas.height;
  const dpr = window.devicePixelRatio;
  const pad = 4 * dpr;

  cpuCtx.clearRect(0, 0, w, h);

  // Grid lines at 25%, 50%, 75%
  cpuCtx.strokeStyle = 'rgba(48,54,61,0.8)';
  cpuCtx.lineWidth   = 1;
  [25, 50, 75].forEach(pct => {
    const y = h - pad - ((pct / 100) * (h - pad * 2));
    cpuCtx.beginPath();
    cpuCtx.moveTo(pad, y);
    cpuCtx.lineTo(w - pad, y);
    cpuCtx.stroke();
  });

  // Fill area
  const drawW = w - pad * 2;
  const drawH = h - pad * 2;
  const step  = drawW / (HISTORY_LEN - 1);

  const gradient = cpuCtx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0,   'rgba(88, 166, 255, 0.35)');
  gradient.addColorStop(1,   'rgba(88, 166, 255, 0.02)');

  cpuCtx.beginPath();
  cpuHistory.forEach((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / 100) * drawH;
    i === 0 ? cpuCtx.moveTo(x, y) : cpuCtx.lineTo(x, y);
  });
  // Close the fill path
  cpuCtx.lineTo(pad + (HISTORY_LEN - 1) * step, h - pad);
  cpuCtx.lineTo(pad, h - pad);
  cpuCtx.closePath();
  cpuCtx.fillStyle = gradient;
  cpuCtx.fill();

  // Line stroke
  cpuCtx.beginPath();
  cpuHistory.forEach((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / 100) * drawH;
    i === 0 ? cpuCtx.moveTo(x, y) : cpuCtx.lineTo(x, y);
  });
  cpuCtx.strokeStyle = '#58a6ff';
  cpuCtx.lineWidth   = 1.5 * dpr;
  cpuCtx.lineJoin    = 'round';
  cpuCtx.stroke();

  // Current % label
  const cur = cpuHistory[cpuHistory.length - 1];
  cpuCtx.fillStyle = '#8b949e';
  cpuCtx.font      = `${10 * dpr}px monospace`;
  cpuCtx.fillText(`${cur.toFixed(1)}%`, pad + 4, pad + 12 * dpr);
}

// ── Memory ────────────────────────────────────────────────────────────────
function renderMemory(mem) {
  const ram  = mem.ram;
  const swap = mem.swap;

  setText('ram-percent', ram.percent.toFixed(1) + '%');
  setText('ram-detail',
    `${ram.used_gb} / ${ram.total_gb} GiB`);
  setBar('bar-ram', ram.percent);

  setText('swap-percent', swap.percent.toFixed(1) + '%');
  setText('swap-detail',
    swap.total_gb > 0
      ? `${swap.used_gb} / ${swap.total_gb} GiB`
      : 'no swap');
  setBar('bar-swap', swap.percent);
}

// ── Disk ──────────────────────────────────────────────────────────────────
function renderDisk(disk) {
  const container = el('disk-list');
  if (!container) return;

  container.innerHTML = disk.partitions.map(p => `
    <div class="disk-item">
      <div class="disk-header">
        <span class="disk-mount">${esc(p.mountpoint)}</span>
        <span class="disk-detail">${p.used_gb} / ${p.total_gb} GiB &nbsp;·&nbsp; ${esc(p.fstype)}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${p.percent >= 90 ? 'crit' : p.percent >= 75 ? 'warn' : ''}"
             style="width:${p.percent}%"></div>
      </div>
      <div style="font-size:0.7rem;color:var(--muted);margin-top:2px">
        ${p.percent}% used · ${p.free_gb} GiB free · ${esc(p.device)}
      </div>
    </div>`).join('') || '<span class="muted">No mounted partitions</span>';
}

// ── Network ───────────────────────────────────────────────────────────────
function renderNetwork(net) {
  const container = el('network-list');
  if (!container) return;

  // Aggregate throughput across all up interfaces for the header summary.
  let totalRx = 0, totalTx = 0;
  net.interfaces.forEach(i => { if (i.is_up) { totalRx += i.rx_kbps; totalTx += i.tx_kbps; } });
  const summary = el('net-throughput-summary');
  if (summary) {
    summary.textContent = totalRx + totalTx > 0
      ? `↓ ${totalRx.toFixed(1)} kB/s  ↑ ${totalTx.toFixed(1)} kB/s`
      : '';
  }

  container.innerHTML = net.interfaces.map(iface => {
    const addrs = iface.addresses
      .map(a => `<div class="net-addr">${esc(a.address)}</div>`)
      .join('');

    // Throughput line: only show when the delta is available (> 0 or interface is active)
    const throughput = iface.rx_kbps > 0 || iface.tx_kbps > 0
      ? `<div class="net-throughput">
           <span class="net-rx">↓ ${iface.rx_kbps.toFixed(1)} kB/s</span>
           <span class="net-tx">↑ ${iface.tx_kbps.toFixed(1)} kB/s</span>
         </div>`
      : '';

    return `
      <div class="net-item">
        <div class="net-header">
          <span class="net-name">${esc(iface.name)}</span>
          <span class="net-badge ${iface.is_up ? 'up' : 'down'}">
            ${iface.is_up ? 'UP' : 'DOWN'}
          </span>
        </div>
        ${addrs}
        ${throughput}
        <div class="net-stats">
          <span>total ↓ ${iface.recv_mb.toFixed(1)} MB</span>
          <span>↑ ${iface.sent_mb.toFixed(1)} MB</span>
          ${iface.speed_mbps ? `<span>${iface.speed_mbps} Mbps</span>` : ''}
          ${iface.errors_in + iface.errors_out > 0
            ? `<span style="color:var(--red)">err: ${iface.errors_in + iface.errors_out}</span>`
            : ''}
        </div>
      </div>`;
  }).join('') || '<span class="muted">No interfaces</span>';
}

// ── Processes ─────────────────────────────────────────────────────────────
function renderProcesses(procs) {
  setText('proc-total', `${procs.total} processes`);
  const tbody = el('proc-tbody');
  if (!tbody) return;

  tbody.innerHTML = procs.items.map(p => {
    const cpuClass = p.cpu_percent >= 50 ? 'cpu-hot'
                   : p.cpu_percent >= 20 ? 'cpu-warm' : '';
    return `<tr>
      <td>${p.pid}</td>
      <td title="${esc(p.name)}">${esc(p.name)}</td>
      <td>${esc(p.user)}</td>
      <td>${esc(p.status)}</td>
      <td class="${cpuClass}">${p.cpu_percent.toFixed(1)}</td>
      <td>${p.mem_percent.toFixed(1)}</td>
      <td>${p.mem_rss_mb.toFixed(1)}</td>
      <td>${p.threads}</td>
    </tr>`;
  }).join('');
}

// ── Sort toggle ───────────────────────────────────────────────────────────
function setSortBy(by) {
  sortBy = by;
  el('sort-cpu').classList.toggle('active', by === 'cpu');
  el('sort-mem').classList.toggle('active', by === 'memory');
}

// ── Loading overlay ───────────────────────────────────────────────────────
function hideOverlay() {
  if (firstLoadDone) return;
  firstLoadDone = true;
  const overlay = el('loading-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  // Remove from DOM after transition so it doesn't block clicks.
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

// ── Error banner ──────────────────────────────────────────────────────────
function showError(msg) {
  const banner = el('error-banner');
  if (!banner) return;
  setText('error-msg', msg);
  banner.hidden = false;
}

function hideError() {
  const banner = el('error-banner');
  if (banner) banner.hidden = true;
}

// ── Polling ───────────────────────────────────────────────────────────────
async function poll() {
  const dot = el('status-dot');
  try {
    const res  = await fetch(`/api/snapshot?sort=${sortBy}&n=20`);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    render(data);
    hideOverlay();
    hideError();
    if (dot) { dot.className = 'status-dot ok'; }
  } catch (err) {
    console.error('Poll error:', err);
    showError(`Connection lost — retrying… (${err.message})`);
    if (dot) { dot.className = 'status-dot err'; }
  }
}

// ── Utility ───────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();

  // Wire up error-banner dismiss button
  const dismissBtn = el('error-dismiss');
  if (dismissBtn) dismissBtn.addEventListener('click', hideError);

  poll();                           // immediate first fetch
  setInterval(poll, POLL_MS);
});
