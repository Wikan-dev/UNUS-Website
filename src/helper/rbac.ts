// ============================================================
// helper/rbac.ts — Role-Based Access Control (RBAC) Frontend
// ============================================================
// Konfigurasi izin akses berdasarkan role user.
// Setiap role memiliki daftar halaman yang boleh diakses.
//
// Role yang dikenal:
//   - admin           : Akses penuh ke semua fitur
//   - dosen           : Bisa lihat semua mahasiswa, tapi tidak edit/hapus
//   - mahasiswa       : Hanya bisa lihat dashboard diri sendiri
//   - calon_mahasiswa : Hanya bisa akses form pendaftaran
// ============================================================

export type UserRole = 'admin' | 'dosen' | 'mahasiswa' | 'calon_mahasiswa';

/**
 * Daftar permission berdasarkan role.
 * Key = relativePath route (sesuai dengan yang di App.tsx)
 */
export interface RolePermissions {
  /** Halaman yang boleh diakses */
  allowedPages: string[];
  /** Apakah bisa melihat seluruh daftar mahasiswa */
  canViewAllStudents: boolean;
  /** Apakah bisa mengedit data mahasiswa */
  canEditStudent: boolean;
  /** Apakah bisa menghapus data mahasiswa */
  canDeleteStudent: boolean;
  /** Apakah bisa melihat dashboard mahasiswa lain */
  canViewOtherDashboard: boolean;
  /** Label tampilan role */
  label: string;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    allowedPages: ['Home', 'DaftarCalonMahasiswa', 'DashBoardMahasiswa', 'HomePage'],
    canViewAllStudents: true,
    canEditStudent: true,
    canDeleteStudent: true,
    canViewOtherDashboard: true,
    label: 'Administrator',
  },
  dosen: {
    allowedPages: ['Home', 'DashBoardMahasiswa', 'HomePage'],
    canViewAllStudents: true,
    canEditStudent: false,
    canDeleteStudent: false,
    canViewOtherDashboard: true,
    label: 'Dosen',
  },
  mahasiswa: {
    allowedPages: ['Home', 'DashBoardMahasiswa', 'HomePage'],
    canViewAllStudents: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canViewOtherDashboard: false,
    label: 'Mahasiswa',
  },
  calon_mahasiswa: {
    allowedPages: ['DaftarCalonMahasiswa', 'HomePage'],
    canViewAllStudents: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canViewOtherDashboard: false,
    label: 'Calon Mahasiswa',
  },
};

/**
 * Mendapatkan permission berdasarkan role string.
 * Jika role tidak dikenal, default ke calon_mahasiswa (paling terbatas).
 */
export function getPermissions(role?: string): RolePermissions {
  if (role && role in ROLE_PERMISSIONS) {
    return ROLE_PERMISSIONS[role as UserRole];
  }
  // Default: role paling terbatas
  return ROLE_PERMISSIONS.calon_mahasiswa;
}

/**
 * Cek apakah user dengan role tertentu boleh mengakses halaman.
 */
export function canAccessPage(role: string | undefined, relativePath: string): boolean {
  const perms = getPermissions(role);
  // Cek exact match atau prefix match (untuk DashBoardMahasiswa/:id)
  return perms.allowedPages.some(
    (page) => relativePath === page || relativePath.startsWith(page + '/')
  );
}

/**
 * Mendapatkan halaman default setelah login berdasarkan role.
 */
export function getDefaultPage(role?: string): string {
  const perms = getPermissions(role);
  return perms.allowedPages[0] || 'HomePage';
}
