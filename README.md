# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
# UNUS-Website

## Cara Menjalankan

Proyek ini punya **2 server** yang harus berjalan bersamaan. Buka **2 terminal**.

### Terminal 1 — Backend PHP (port 8080)

```bash
cd /home/wikan/Documents/tugas/ngoding/belajarPHP/UNUSREACT/unusreact
php -S localhost:8080 -t backend
```

### Terminal 2 — Frontend React (port 5173)

```bash
cd /home/wikan/Documents/tugas/ngoding/belajarPHP/UNUSREACT/unusreact
pnpm dev
```

Lalu buka <http://localhost:5173>.

> **Penting:** server PHP harus jalan lebih dulu. Kalau `pnpm dev` dijalankan
> duluan, tabel akan menampilkan "Gagal mengambil data dari server".

## Struktur

```
unusreact/
├── backend/              # Server PHP
│   ├── config.php        # Koneksi database MySQL (db: unus)
│   └── api.php           # Endpoint API, accessed via ?endpoint=mahasiswa
├── src/
│   ├── App.tsx           # Komponen React + tabel data
│   ├── main.tsx          # Entry point React
│   └── index.css         # Import Tailwind CSS
├── vite.config.ts        # Proxy: /api.php -> http://localhost:8080
└── index.html
```

## Alur Data

```
Browser (React :5173)
   └─> fetch('/api.php?endpoint=mahasiswa')
        └─> Vite proxy
             └─> api.php (:8080)
                  └─> config.php -> MySQL (db: unus)
                       └─> JSON kembali ke React
                       └─> .map() merender <tr> di dalam <table>
```

## Database

Menggunakan database `unus` di MySQL, tabel `mahasiswa`:

| Kolom | Tipe |
| --- | --- |
| `nim` | varchar(20) — primary key |
| `nama_lengkap` | varchar(255) |
| `program_studi` | varchar(100) |
| `angkatan` | year(4) |
| `status_akademik` | enum('Aktif','Cuti','Lulus','DO') |

Kalau nama kolom di `api.php` tidak sama dengan tabel di database,
PHP akan mengembalikan error `Unknown column` di dalam JSON.
