import { useParams } from 'react-router-dom';

/**
 * Hook untuk mendapatkan base path sesi saat ini.
 * Semua navigasi internal harus menggunakan path ini sebagai prefix.
 *
 * Contoh:
 *   const basePath = useSessionPath();
 *   // basePath = "/s/abc123def456..."
 *   // Gunakan: `${basePath}/Home`, `${basePath}/DashBoardMahasiswa`, dll.
 */
export function useSessionPath(): string {
  const { sessionHash } = useParams<{ sessionHash: string }>();
  return sessionHash ? `/s/${sessionHash}` : '';
}
