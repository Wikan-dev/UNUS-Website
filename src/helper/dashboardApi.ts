// ============================================================
// helper/dashboardApi.ts
// Fungsi komunikasi API dan deteksi perubahan data mahasiswa
// ============================================================

import type { Mahasiswa } from './types';
import type { StudentFormData, FieldChange } from './dashboardTypes';

/**
 * Mengambil daftar seluruh mahasiswa untuk navigasi dropdown cepat
 */
export async function fetchAllMahasiswa(): Promise<Mahasiswa[]> {
  const res = await fetch('/api.php?endpoint=mahasiswa');
  if (!res.ok) {
    throw new Error('Gagal memuat daftar mahasiswa.');
  }
  return res.json();
}

/**
 * Mengambil 1 detail mahasiswa berdasarkan hash profil atau NIM
 */
export async function fetchMahasiswaDetail(identifier: string): Promise<Mahasiswa> {
  const res = await fetch(`/api.php?endpoint=mahasiswa&h=${encodeURIComponent(identifier)}`);
  if (res.status === 404) {
    throw new Error('Profil mahasiswa tidak ditemukan di pangkalan data.');
  }
  if (!res.ok) {
    throw new Error('Gagal memuat detail data mahasiswa.');
  }
  return res.json();
}

/**
 * Menyimpan seluruh perubahan data mahasiswa ke server
 */
export async function updateMahasiswaDetail(
  originalNim: string,
  formData: StudentFormData
): Promise<Mahasiswa> {
  const payload = {
    original_nim: originalNim,
    nim: formData.nim.trim(),
    nama_lengkap: formData.nama_lengkap.trim(),
    program_studi: formData.program_studi.trim(),
    angkatan: Number(formData.angkatan),
    status_akademik: formData.status_akademik,
    dosen_wali_nidn: formData.dosen_wali_nidn.trim() || null,
    user_email: formData.user_email.trim() || null,
  };

  const res = await fetch('/api.php?endpoint=mahasiswa', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Gagal menyimpan perubahan ke basis data.');
  }

  return resData.data;
}

/**
 * Menghapus data mahasiswa secara permanen dari server
 */
export async function deleteMahasiswaPermanent(nim: string): Promise<void> {
  const res = await fetch(`/api.php?endpoint=mahasiswa&nim=${encodeURIComponent(nim)}`, {
    method: 'DELETE',
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Gagal menghapus data mahasiswa.');
  }
}

/**
 * Mendeteksi setiap perbedaan antara data asli dengan isian form
 */
export function detectStudentChanges(
  mhs: Mahasiswa | null,
  formData: StudentFormData
): FieldChange[] {
  if (!mhs) return [];
  const list: FieldChange[] = [];

  if (formData.nama_lengkap.trim() !== (mhs.nama_lengkap || '').trim()) {
    list.push({
      label: 'Nama Lengkap',
      oldVal: mhs.nama_lengkap || '-',
      newVal: formData.nama_lengkap,
    });
  }

  if (formData.program_studi.trim() !== (mhs.program_studi || '').trim()) {
    list.push({
      label: 'Program Studi',
      oldVal: mhs.program_studi || '-',
      newVal: formData.program_studi,
    });
  }

  if (Number(formData.angkatan) !== Number(mhs.angkatan)) {
    list.push({
      label: 'Tahun Angkatan',
      oldVal: String(mhs.angkatan || '-'),
      newVal: String(formData.angkatan),
    });
  }

  if ((formData.dosen_wali_nidn || '').trim() !== (mhs.dosen_wali_nidn || '').trim()) {
    list.push({
      label: 'Dosen Wali (NIDN)',
      oldVal: mhs.dosen_wali_nidn || 'Belum Ditentukan',
      newVal: formData.dosen_wali_nidn || 'Dikosongkan',
    });
  }

  if ((formData.user_email || '').trim() !== (mhs.user_email || '').trim()) {
    list.push({
      label: 'Email Akun Mahasiswa',
      oldVal: mhs.user_email || '-',
      newVal: formData.user_email || '-',
    });
  }

  // --- DATA SENSITIF ---
  if (formData.nim.trim() !== (mhs.nim || '').trim()) {
    list.push({
      label: 'NIM (Primary Key & Hash Profil)',
      oldVal: mhs.nim || '-',
      newVal: formData.nim,
      isSensitive: true,
    });
  }

  if (formData.status_akademik.trim() !== (mhs.status_akademik || '').trim()) {
    list.push({
      label: 'Status Akademik',
      oldVal: mhs.status_akademik || '-',
      newVal: formData.status_akademik,
      isSensitive: true,
    });
  }

  return list;
}
