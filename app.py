"""
NIKTO System Monitor — Flask backend
Serves the static dashboard and exposes a lightweight JSON API.

API routes:
  GET /api/snapshot      — all metrics in one call (used by the dashboard)
  GET /api/cpu           — CPU only
  GET /api/memory        — memory only
  GET /api/disk          — disk only
  GET /api/network       — network only
  GET /api/processes     — process list (?sort=cpu|memory&n=20)
  GET /api/system        — static system info
"""
import os
from flask import Flask, jsonify, request, send_from_directory

from monitor.cpu import get_cpu_info
from monitor.memory import get_memory_info
from monitor.disk import get_disk_info
from monitor.network import get_network_info
from monitor.processes import get_processes
from monitor.system import get_system_info

# Initialise psutil CPU percent baseline on first import so the first
# real reading (after 1 poll cycle) is accurate.
import psutil as _psutil
_psutil.cpu_percent(interval=None)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = Flask(__name__, static_folder=STATIC_DIR)


# ── Static files ────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_DIR, filename)


# ── API ──────────────────────────────────────────────────────────────────────

@app.route("/api/snapshot")
def snapshot():
    """All metrics in a single round-trip — this is what the dashboard polls."""
    sort_by = request.args.get("sort", "cpu")
    n = int(request.args.get("n", 20))
    return jsonify({
        "system": get_system_info(),
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "network": get_network_info(),
        "processes": get_processes(top_n=n, sort_by=sort_by),
    })


@app.route("/api/cpu")
def cpu():
    return jsonify(get_cpu_info())


@app.route("/api/memory")
def memory():
    return jsonify(get_memory_info())


@app.route("/api/disk")
def disk():
    return jsonify(get_disk_info())


@app.route("/api/network")
def network():
    return jsonify(get_network_info())


@app.route("/api/processes")
def processes():
    sort_by = request.args.get("sort", "cpu")
    n = int(request.args.get("n", 20))
    return jsonify(get_processes(top_n=n, sort_by=sort_by))


@app.route("/api/system")
def system():
    return jsonify(get_system_info())


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    host = os.environ.get("NIKTO_HOST", "127.0.0.1")
    port = int(os.environ.get("NIKTO_PORT", "5000"))
    print(f"\n  NIKTO System Monitor  →  http://{host}:{port}\n")
    # threaded=False keeps CPU usage minimal; one request at a time is fine
    # for a single-user local dashboard.
    app.run(host=host, port=port, debug=False, threaded=False)
