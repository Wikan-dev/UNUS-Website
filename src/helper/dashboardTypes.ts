// ============================================================
// helper/dashboardTypes.ts
// Tipe-tipe data yang digunakan khusus pada modul Dashboard
// ============================================================

export interface StudentFormData {
  nim: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan: number;
  status_akademik: string;
  dosen_wali_nidn: string;
  user_email: string;
}

export interface FieldChange {
  label: string;
  oldVal: string;
  newVal: string;
  isSensitive?: boolean;
}

export interface ModalConfig {
  isOpen: boolean;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmButtonClass?: string;
  dangerBadgeText?: string;
  requireInputMatch?: string;
  changesSummary?: FieldChange[];
  onConfirm: () => void | Promise<void>;
}

export interface StatusOption {
  value: string;
  label: string;
  desc: string;
  badgeClass: string;
}
