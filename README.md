# NIKTO System Monitor

A lightweight, real-time system monitoring dashboard built with Flask and vanilla JavaScript. No frontend frameworks, no build step — just a Python backend and a single HTML page.

## Features

- **Live dashboard** — polls every 2 seconds, 2-minute CPU history sparkline
- **CPU** — overall %, per-core bars, frequency, temperature (coretemp / k10temp / acpitz), load average (1m / 5m / 15m)
- **Memory** — RAM and swap usage in GiB with percentage bars
- **Disk** — usage per mounted partition (device, mountpoint, filesystem, free space)
- **Network** — per-interface live throughput (kB/s TX/RX), total sent/received, IP addresses, error counts
- **Processes** — top-20 table, sortable by CPU or memory (pid, name, user, status, CPU%, mem%, RSS, threads)
- **REST API** — all metrics available as JSON endpoints

## Requirements

- Python 3.8+
- `nikto` itself is not required — the name is the project name, not a dependency

## Quick start

```bash
git clone https://github.com/Maull123es/NIKTO-System-Monitor.git
cd nikto-monitor
bash run.sh
```

`run.sh` creates a virtual environment on first run, installs dependencies, and starts the server.

Open **http://127.0.0.1:5000** in your browser.

## Manual setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Configuration

The server reads two optional environment variables:

| Variable      | Default       | Description           |
|---------------|---------------|-----------------------|
| `NIKTO_HOST`  | `127.0.0.1`   | Bind address          |
| `NIKTO_PORT`  | `5000`        | Listen port           |

Example — expose on all interfaces:

```bash
NIKTO_HOST=0.0.0.0 bash run.sh
```

## API reference

All endpoints return JSON. CORS is not configured; use the dashboard on the same origin or proxy through Flask.

### `GET /api/snapshot`

All metrics in a single request. Used by the dashboard on every poll.

Query params:
- `sort` — `cpu` (default) or `memory` — process sort order
- `n` — integer, number of processes to return (default `20`)

### `GET /api/cpu`

```json
{
  "percent": 12.3,
  "per_core": [8.0, 14.0, 11.0, 16.0],
  "count_logical": 4,
  "count_physical": 2,
  "freq_mhz": 2400.0,
  "freq_max_mhz": 3600.0,
  "temperature": { "source": "coretemp", "current": 52.0, "high": 80.0, "critical": 100.0 },
  "load_avg": [0.42, 0.38, 0.35]
}
```

### `GET /api/memory`

```json
{
  "ram":  { "total_gb": 15.5, "used_gb": 6.2, "available_gb": 9.3, "percent": 40.0, "buffers_gb": 0.3, "cached_gb": 2.1 },
  "swap": { "total_gb": 2.0,  "used_gb": 0.0, "free_gb": 2.0, "percent": 0.0 }
}
```

### `GET /api/disk`

```json
{
  "partitions": [
    { "device": "/dev/sda1", "mountpoint": "/", "fstype": "ext4",
      "total_gb": 233.47, "used_gb": 42.1, "free_gb": 191.37, "percent": 18.1 }
  ],
  "io_totals": { "read_gb": 12.4, "write_gb": 5.7, "read_count": 412000, "write_count": 183000 }
}
```

### `GET /api/network`

```json
{
  "interfaces": [
    {
      "name": "eth0", "is_up": true, "speed_mbps": 1000,
      "sent_mb": 142.3, "recv_mb": 891.0,
      "tx_kbps": 12.4, "rx_kbps": 88.1,
      "packets_sent": 94200, "packets_recv": 310400,
      "errors_in": 0, "errors_out": 0,
      "addresses": [{ "family": "AF_INET", "address": "192.168.1.10", "netmask": "255.255.255.0" }]
    }
  ]
}
```

Throughput (`tx_kbps` / `rx_kbps`) is a delta from the previous call; the first call always returns `0.0`.

### `GET /api/processes`

Query params: `sort` (`cpu` or `memory`), `n` (default `20`).

```json
{
  "total": 183,
  "sort_by": "cpu",
  "items": [
    { "pid": 1234, "name": "python3", "status": "running", "user": "alice",
      "cpu_percent": 14.2, "mem_percent": 1.3, "mem_rss_mb": 102.4, "threads": 4 }
  ]
}
```

### `GET /api/system`

```json
{
  "hostname": "myhost",
  "os_name": "Ubuntu 22.04.3 LTS",
  "kernel": "6.2.0-39-generic",
  "architecture": "x86_64",
  "python_version": "3.11.4",
  "uptime": { "seconds": 86412, "human": "24h 0m 12s" },
  "boot_time": 1700000000.0,
  "cpu_model": "Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz",
  "user": "alice"
}
```

## Project structure

```
nikto-monitor/
├── app.py              # Flask app and route definitions
├── run.sh              # Convenience launcher (creates venv, installs deps)
├── requirements.txt    # flask, psutil
├── monitor/
│   ├── cpu.py          # CPU metrics
│   ├── memory.py       # RAM and swap metrics
│   ├── disk.py         # Disk usage and I/O counters
│   ├── network.py      # Network interface stats and throughput
│   ├── processes.py    # Process list
│   └── system.py       # Hostname, OS, kernel, uptime
└── static/
    ├── index.html      # Dashboard HTML
    ├── dashboard.js    # Polling, rendering, canvas chart
    └── style.css       # Styles
```

## Dependencies

| Package  | Version range | Purpose                  |
|----------|---------------|--------------------------|
| Flask    | `>=3.0,<4.0`  | HTTP server and routing  |
| psutil   | `>=5.9,<7.0`  | System metrics           |
```
## Author

```
Jana Maulana Fajar 
```
Made with 💕