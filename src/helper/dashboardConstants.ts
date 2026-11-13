// ============================================================
// helper/dashboardConstants.ts
// Konstanta konfigurasi untuk opsi program studi dan status
// ============================================================

import type { StatusOption } from './dashboardTypes';

export const DEFAULT_YEAR = 2025;

export const PRODI_OPTIONS: string[] = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Elektro',
  'Teknik Industri',
  'Ilmu Komunikasi',
  'Manajemen',
  'Akuntansi',
  'Hukum',
];

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'Aktif',
    label: 'Aktif',
    desc: 'Mahasiswa terdaftar aktif mengikuti kegiatan akademik perkuliahan & KRS.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    value: 'Cuti',
    label: 'Cuti',
    desc: 'Mahasiswa mengambil masa cuti resmi, hak akses pengisian KRS dihentikan sementara.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    value: 'Lulus',
    label: 'Lulus',
    desc: 'Mahasiswa telah menyelesaikan seluruh kurikulum dan yudisium.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    value: 'DO',
    label: 'DO (Drop Out)',
    desc: 'Status kritis: mahasiswa diberhentikan secara permanen dari pangkalan data akademik.',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
  },
];
