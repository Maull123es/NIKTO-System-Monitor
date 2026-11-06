"""System-level info: hostname, uptime, OS, kernel, boot time."""
import os
import time
import platform
import psutil


def _read_os_release() -> dict:
    fields = {}
    try:
        with open("/etc/os-release") as f:
            for line in f:
                line = line.strip()
                if "=" in line:
                    k, _, v = line.partition("=")
                    fields[k] = v.strip('"')
    except OSError:
        pass
    return fields


def get_system_info() -> dict:
    boot_ts = psutil.boot_time()
    uptime_secs = int(time.time() - boot_ts)
    h, rem = divmod(uptime_secs, 3600)
    m, s = divmod(rem, 60)

    os_info = _read_os_release()

    return {
        "hostname": platform.node(),
        "os_name": os_info.get("PRETTY_NAME", platform.system()),
        "kernel": platform.release(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "uptime": {
            "seconds": uptime_secs,
            "human": f"{h}h {m}m {s}s",
        },
        "boot_time": boot_ts,
        "cpu_model": _get_cpu_model(),
        "user": os.environ.get("USER", os.environ.get("LOGNAME", "unknown")),
    }


def _get_cpu_model() -> str:
    try:
        with open("/proc/cpuinfo") as f:
            for line in f:
                if line.startswith("model name"):
                    return line.split(":", 1)[1].strip()
    except OSError:
        pass
    return platform.processor() or "Unknown"
