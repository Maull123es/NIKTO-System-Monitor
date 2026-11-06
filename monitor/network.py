"""Network metrics: per-interface stats, live throughput, and total I/O.

Throughput (bytes/s) is computed by comparing the current counter snapshot
against the previous one.  The module keeps a dict of (bytes_sent,
bytes_recv, timestamp) keyed by interface name.  On the very first call the
throughput values are 0 — they become meaningful from the second poll onward.
"""
import time
import socket
import psutil

# Module-level state for delta-based throughput calculation.
# { iface_name: (bytes_sent, bytes_recv, timestamp) }
_prev: dict[str, tuple[int, int, float]] = {}


def _fmt_mb(b: int) -> float:
    return round(b / (1024 ** 2), 2)


def _fmt_kbps(bps: float) -> float:
    """Return kB/s rounded to 1 decimal."""
    return round(bps / 1024, 1)


def _safe_family_name(family) -> str:
    """Return the address-family string, safe for both enum types."""
    try:
        name = family.name  # works for socket.AddressFamily (Python ≥3.4)
    except AttributeError:
        name = str(family)
    return name


def get_network_info() -> dict:
    global _prev

    now = time.monotonic()
    io_counters = psutil.net_io_counters(pernic=True)
    addrs       = psutil.net_if_addrs()
    stats       = psutil.net_if_stats()

    interfaces = []
    for iface, counters in io_counters.items():
        if iface == "lo":
            continue

        # ── Throughput ───────────────────────────────────────────────────
        tx_kbps = 0.0
        rx_kbps = 0.0
        if iface in _prev:
            prev_sent, prev_recv, prev_ts = _prev[iface]
            dt = now - prev_ts
            if dt > 0:
                tx_kbps = _fmt_kbps((counters.bytes_sent - prev_sent) / dt)
                rx_kbps = _fmt_kbps((counters.bytes_recv - prev_recv) / dt)
        _prev[iface] = (counters.bytes_sent, counters.bytes_recv, now)

        # ── Addresses ────────────────────────────────────────────────────
        iface_stats = stats.get(iface)
        ip_addresses = []
        for addr in addrs.get(iface, []):
            family_name = _safe_family_name(addr.family)
            if family_name in ("AF_INET", "AF_INET6"):
                ip_addresses.append({
                    "family":  family_name,
                    "address": addr.address,
                    "netmask": addr.netmask,
                })

        interfaces.append({
            "name":         iface,
            "is_up":        iface_stats.isup  if iface_stats else False,
            "speed_mbps":   iface_stats.speed if iface_stats else 0,
            "sent_mb":      _fmt_mb(counters.bytes_sent),
            "recv_mb":      _fmt_mb(counters.bytes_recv),
            "tx_kbps":      max(0.0, tx_kbps),   # clamp negative on counter wrap
            "rx_kbps":      max(0.0, rx_kbps),
            "packets_sent": counters.packets_sent,
            "packets_recv": counters.packets_recv,
            "errors_in":    counters.errin,
            "errors_out":   counters.errout,
            "addresses":    ip_addresses,
        })

    # Up interfaces first, then alphabetical
    interfaces.sort(key=lambda x: (not x["is_up"], x["name"]))

    return {"interfaces": interfaces}
