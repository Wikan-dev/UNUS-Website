import { useParams, Link } from 'react-router-dom';
import { useDashboardController } from '../helper/useDashboardController';
import { useSessionPath } from '../helper/useSessionPath';

// Subkomponen Modular Dashboard
import DashboardNotice from '../components/dashboard/DashboardNotice';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import AcademicStatsCards from '../components/dashboard/AcademicStatsCards';
import GeneralInfoSection from '../components/dashboard/GeneralInfoSection';
import DangerZoneSection from '../components/dashboard/DangerZoneSection';
import ActionConfirmModal from '../components/dashboard/ActionConfirmModal';

export default function DashboardMahasiswa() {
  const { IDMahasiswa } = useParams<{ IDMahasiswa?: string }>();
  const basePath = useSessionPath();

  const {
    mhs,
    allStudents,
    loading,
    saving,
    error,
    successNotice,
    isEditing,
    formData,
    hasAdminAccess,
    detectedChanges,
    hasSensitiveChanges,
    modalConfig,
    closeModal,
    handleFormChange,
    handleToggleAdmin,
    handleClearSuccess,
    handleClearError,
    triggerEnterEditMode,
    triggerCancelEdit,
    triggerResetForm,
    triggerSaveAll,
    triggerSaveSensitiveOnly,
    triggerDeleteStudent,
  } = useDashboardController(IDMahasiswa);

  // Jika belum ada mahasiswa yang dipilih (URL: /DashBoardMahasiswa)
  if (!IDMahasiswa) {
    return <EmptyDashboard allStudents={allStudents} />;
  }

  // Tampilan saat memuat data dari server
  if (loading) {
    return (
      <div className='p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-gray-500'>
        <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4' />
        <p className='text-sm font-medium'>Memuat data detail mahasiswa...</p>
      </div>
    );
  }

  // Tampilan jika terjadi kesalahan dan data mahasiswa kosong
  if (error && !mhs) {
    return (
      <div className='p-6 md:p-10 w-full max-w-4xl mx-auto'>
        <div className='bg-red-50 border-2 border-red-200 text-red-800 p-6 rounded-2xl mb-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-2'>
            <span className='text-2xl'>⚠️</span>
            <h3 className='font-bold text-lg'>Terjadi Kesalahan</h3>
          </div>
          <p className='text-sm text-red-700'>{error}</p>
        </div>
        <Link
          to={`${basePath}/Home`}
          className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition'
        >
          ← Kembali ke Halaman Home
        </Link>
      </div>
    );
  }

  if (!mhs) return null;

  return (
    <div className='p-6 md:p-10 w-full max-w-6xl mx-auto space-y-8'>
      {/* Notifikasi Umpan Balik (Sukses / Error) */}
      <DashboardNotice
        successNotice={successNotice}
        error={error}
        onClearSuccess={handleClearSuccess}
        onClearError={handleClearError}
      />

      {/* Header Utama & Kontrol Administrator */}
      <DashboardHeader
        mhs={mhs}
        formData={formData}
        isEditing={isEditing}
        hasAdminAccess={hasAdminAccess}
        saving={saving}
        detectedChanges={detectedChanges}
        onToggleAdmin={handleToggleAdmin}
        onEnterEditMode={triggerEnterEditMode}
        onCancelEdit={triggerCancelEdit}
        onResetForm={triggerResetForm}
        onSaveAll={triggerSaveAll}
      />

      {/* Ringkasan Kartu Akademik (Quick Stats) */}
      <AcademicStatsCards mhs={mhs} formData={formData} isEditing={isEditing} />

      {/* Section 1: Data Identitas & Informasi Akademik Umum */}
      <GeneralInfoSection
        mhs={mhs}
        formData={formData}
        isEditing={isEditing}
        onFormChange={handleFormChange}
      />

      {/* Section 2 (PALING BAWAH): Zona Data Sensitif & Berbahaya */}
      <DangerZoneSection
        mhs={mhs}
        formData={formData}
        isEditing={isEditing}
        saving={saving}
        hasSensitiveChanges={hasSensitiveChanges}
        onFormChange={handleFormChange}
        onSaveSensitiveOnly={triggerSaveSensitiveOnly}
        onDeleteStudent={triggerDeleteStudent}
      />

      {/* Dialog Peringatan / Modal Konfirmasi Interaktif */}
      {modalConfig && modalConfig.isOpen && (
        <ActionConfirmModal config={modalConfig} onClose={closeModal} />
      )}
    </div>
  );
}
