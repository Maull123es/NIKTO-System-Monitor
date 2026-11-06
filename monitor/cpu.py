"""CPU metrics: usage, frequency, temperature, per-core breakdown."""
import psutil


def get_cpu_info() -> dict:
    freq = psutil.cpu_freq()
    # Collect per-core and overall in one call to keep them consistent.
    # interval=None uses the delta since the last call (primed at import time).
    per_core = psutil.cpu_percent(percpu=True, interval=None)
    overall  = round(sum(per_core) / len(per_core), 1) if per_core else 0.0

    temps = {}
    try:
        raw = psutil.sensors_temperatures()
        # Prefer coretemp, then k10temp, then whatever is first
        for key in ("coretemp", "k10temp", "acpitz"):
            if key in raw:
                entries = raw[key]
                temps = {
                    "source": key,
                    "current": round(entries[0].current, 1),
                    "high": entries[0].high,
                    "critical": entries[0].critical,
                }
                break
        else:
            if raw:
                key, entries = next(iter(raw.items()))
                temps = {
                    "source": key,
                    "current": round(entries[0].current, 1),
                    "high": entries[0].high,
                    "critical": entries[0].critical,
                }
    except (AttributeError, OSError):
        # sensors_temperatures not available on this platform/kernel
        temps = {}

    return {
        "percent": overall,
        "per_core": per_core,
        "count_logical": psutil.cpu_count(logical=True),
        "count_physical": psutil.cpu_count(logical=False),
        "freq_mhz": round(freq.current, 0) if freq else None,
        "freq_max_mhz": round(freq.max, 0) if freq else None,
        "temperature": temps,
        "load_avg": [round(x, 2) for x in psutil.getloadavg()],
    }
