NIKTO System Monitor

Lightweight Linux System Monitoring Dashboard

NIKTO System Monitor merupakan proyek aplikasi pemantauan sistem Linux yang dirancang untuk membantu pengguna memahami kondisi dan penggunaan sumber daya perangkat melalui satu dashboard yang sederhana, informatif, dan ringan.

Proyek ini berfokus pada efisiensi penggunaan sumber daya, modularitas aplikasi, serta pengembangan kemampuan analisis menggunakan AI Agent.

Project Overview

Informasi sistem Linux biasanya perlu diperiksa melalui berbagai perintah terminal atau aplikasi yang berbeda. Hal ini dapat menyulitkan pengguna, khususnya pemula, ketika ingin memahami kondisi sistem secara menyeluruh.

NIKTO System Monitor dikembangkan sebagai solusi untuk mengumpulkan informasi penting mengenai kondisi sistem ke dalam satu antarmuka yang lebih mudah dipahami.

Main Features

Fitur utama yang menjadi fokus pengembangan:

- CPU Monitoring — Memantau penggunaan CPU, jumlah core, frekuensi, dan load average.
- Memory Monitoring — Menampilkan total RAM, penggunaan RAM, memori tersedia, dan swap.
- Storage Monitoring — Memantau kapasitas penyimpanan, ruang terpakai, ruang tersedia, dan filesystem yang terpasang.
- Process Monitoring — Menampilkan proses yang berjalan, PID, penggunaan CPU, dan penggunaan memori.
- Network Monitoring — Memantau antarmuka jaringan serta aktivitas upload dan download.
- System Information — Menampilkan informasi distribusi Linux, kernel, hostname, dan uptime.
- Dashboard Interface — Menyajikan informasi sistem dalam tampilan yang terstruktur.

«Catatan: Daftar di atas merupakan cakupan fitur yang ditargetkan. Ketersediaan setiap fitur bergantung pada hasil implementasi saat ini.»

AI Agent Integration

NIKTO System Monitor dirancang untuk dikembangkan dengan dukungan AI Agent sebagai asisten analisis sistem Linux.

Kemampuan yang direncanakan meliputi:

- Menganalisis penggunaan sumber daya sistem.
- Menjelaskan kondisi CPU dan RAM dengan bahasa yang mudah dipahami.
- Membantu mengidentifikasi penggunaan sumber daya yang tidak biasa.
- Memberikan rekomendasi berdasarkan data monitoring.
- Membantu pengguna memahami kemungkinan penyebab masalah performa sistem.

AI Agent merupakan bagian dari arah pengembangan proyek dan tidak dianggap sebagai fitur yang sudah tersedia sebelum integrasinya benar-benar diimplementasikan dan diuji.

Technology Stack

Teknologi yang direncanakan atau digunakan dalam pengembangan:

- Python — Pengembangan backend dan pengolahan informasi sistem.
- HTML, CSS, JavaScript — Pengembangan antarmuka dashboard berbasis web.
- Linux — Lingkungan sistem operasi utama.
- SQLite — Opsi penyimpanan data monitoring secara lokal.
- AI Agent — Pengembangan kemampuan analisis dan interaksi berbasis AI.

Design Principles

NIKTO System Monitor dikembangkan dengan beberapa prinsip utama:

1. Lightweight: Mengutamakan penggunaan CPU dan RAM yang efisien.
2. Modular: Memisahkan komponen agar mudah dikembangkan dan dipelihara.
3. Readable: Menampilkan informasi dengan struktur yang mudah dipahami.
4. Local-first: Mengutamakan pemrosesan dan pemantauan secara lokal.
5. Extensible: Memungkinkan penambahan fitur dan integrasi di masa mendatang.

Project Roadmap

Rencana pengembangan NIKTO System Monitor:

- [ ] Implementasi monitoring CPU dan RAM.
- [ ] Implementasi monitoring storage dan proses.
- [ ] Implementasi monitoring jaringan.
- [ ] Pengembangan dashboard monitoring.
- [ ] Penyimpanan riwayat penggunaan sumber daya.
- [ ] Integrasi AI Agent.
- [ ] Deteksi anomali penggunaan sumber daya.
- [ ] Sistem notifikasi.
- [ ] Dukungan berbagai distribusi Linux.
- [ ] Monitoring beberapa perangkat.

Checklist akan diperbarui mengikuti perkembangan implementasi.

Target Platform

Pengembangan awal difokuskan pada:

- Kali Linux
- Debian-based Linux distributions

Dukungan terhadap distribusi Linux lainnya menjadi salah satu rencana pengembangan berikutnya.

Project Status

Status: In Development

NIKTO System Monitor masih dalam tahap pengembangan. Struktur aplikasi, fitur monitoring, antarmuka, dan integrasi AI Agent akan disempurnakan secara bertahap.

Future Development

Pengembangan selanjutnya akan berfokus pada peningkatan kemampuan monitoring, analisis sistem berbasis AI, integrasi dengan layanan Linux, serta optimalisasi performa aplikasi agar tetap ringan ketika dijalankan pada perangkat dengan spesifikasi terbatas.

Author

NIKTO MRK

Project: NIKTO System Monitor

---

Built for learning, system exploration, and lightweight Linux monitoring.
