"""Memory metrics: RAM and swap usage."""
import psutil


def _fmt(bytes_val: int) -> float:
    """Return value in GiB rounded to 2 decimals."""
    return round(bytes_val / (1024 ** 3), 2)


def get_memory_info() -> dict:
    ram = psutil.virtual_memory()
    swap = psutil.swap_memory()

    return {
        "ram": {
            "total_gb": _fmt(ram.total),
            "used_gb": _fmt(ram.used),
            "available_gb": _fmt(ram.available),
            "percent": ram.percent,
            "buffers_gb": _fmt(getattr(ram, "buffers", 0)),
            "cached_gb": _fmt(getattr(ram, "cached", 0)),
        },
        "swap": {
            "total_gb": _fmt(swap.total),
            "used_gb": _fmt(swap.used),
            "free_gb": _fmt(swap.free),
            "percent": swap.percent,
        },
    }
