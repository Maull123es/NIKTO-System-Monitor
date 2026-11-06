"""Disk metrics: usage per mounted partition, I/O counters."""
import psutil


def _fmt_gb(b: int) -> float:
    return round(b / (1024 ** 3), 2)


def get_disk_info() -> dict:
    partitions = []
    for part in psutil.disk_partitions(all=False):
        # Skip pseudo-filesystems (tmpfs, devtmpfs, squashfs …)
        if part.fstype in ("", "squashfs", "devtmpfs", "tmpfs"):
            continue
        try:
            usage = psutil.disk_usage(part.mountpoint)
        except PermissionError:
            continue
        partitions.append({
            "device": part.device,
            "mountpoint": part.mountpoint,
            "fstype": part.fstype,
            "total_gb": _fmt_gb(usage.total),
            "used_gb": _fmt_gb(usage.used),
            "free_gb": _fmt_gb(usage.free),
            "percent": usage.percent,
        })

    io = {}
    try:
        counters = psutil.disk_io_counters()
        if counters:
            io = {
                "read_gb": _fmt_gb(counters.read_bytes),
                "write_gb": _fmt_gb(counters.write_bytes),
                "read_count": counters.read_count,
                "write_count": counters.write_count,
            }
    except (AttributeError, OSError):
        pass

    return {"partitions": partitions, "io_totals": io}
