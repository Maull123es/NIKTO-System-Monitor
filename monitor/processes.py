"""Process list: top-N processes by CPU and memory."""
import psutil


_PROC_ATTRS = [
    "pid", "name", "status", "username",
    "cpu_percent", "memory_percent", "memory_info",
    "num_threads", "create_time",
]


def get_processes(top_n: int = 20, sort_by: str = "cpu") -> dict:
    """
    Return top_n processes sorted by cpu_percent or memory_percent.
    sort_by: "cpu" | "memory"
    """
    processes = []
    for proc in psutil.process_iter(_PROC_ATTRS):
        try:
            info = proc.info
            rss_mb = round(info["memory_info"].rss / (1024 ** 2), 1) if info["memory_info"] else 0
            processes.append({
                "pid": info["pid"],
                "name": info["name"] or "?",
                "status": info["status"],
                "user": info["username"] or "?",
                "cpu_percent": round(info["cpu_percent"] or 0, 1),
                "mem_percent": round(info["memory_percent"] or 0, 1),
                "mem_rss_mb": rss_mb,
                "threads": info["num_threads"],
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    key = "mem_percent" if sort_by == "memory" else "cpu_percent"
    processes.sort(key=lambda p: p[key], reverse=True)

    return {
        "total": len(processes),
        "sort_by": sort_by,
        "items": processes[:top_n],
    }
