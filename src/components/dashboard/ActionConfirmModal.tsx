import { useState, type ReactElement } from 'react';
import type { ModalConfig } from '../../helper/dashboardTypes';

interface ActionConfirmModalProps {
  config: ModalConfig;
  onClose: () => void;
}

export default function ActionConfirmModal({ config, onClose }: ActionConfirmModalProps): ReactElement {
  const [typedInput, setTypedInput] = useState('');

  const isConfirmDisabled =
    Boolean(config.requireInputMatch) && typedInput.trim() !== config.requireInputMatch;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in'>
      <div
        className='bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-5 animate-scale-up'
        role='dialog'
        aria-modal='true'
      >
        {/* Header Modal */}
        <div className='flex items-start gap-4'>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
              config.type === 'danger'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : config.type === 'warning'
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {config.type === 'danger' ? '🚨' : config.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className='flex-1'>
            {config.dangerBadgeText && (
              <span className='inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white mb-1'>
                {config.dangerBadgeText}
              </span>
            )}
            <h3 className='text-lg font-bold font-merrie text-gray-900'>{config.title}</h3>
            <p className='text-xs text-gray-600 mt-1.5 leading-relaxed'>{config.description}</p>
          </div>
        </div>

        {/* Rangkuman Perubahan Data (Jika Ada) */}
        {config.changesSummary && config.changesSummary.length > 0 && (
          <div className='bg-gray-50 p-4 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto space-y-2.5'>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider'>
              Rincian Perubahan Data:
            </p>
            {config.changesSummary.map((item, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-xl border text-xs ${
                  item.isSensitive
                    ? 'bg-red-50/80 border-red-200 text-red-900'
                    : 'bg-white border-gray-200 text-gray-800'
                }`}
              >
                <div className='flex items-center justify-between font-semibold'>
                  <span>{item.label}</span>
                  {item.isSensitive && (
                    <span className='text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded'>
                      Sensitif
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2 mt-1 text-[11px] font-mono'>
                  <span className='line-through text-gray-400 truncate max-w-[150px]'>
                    {item.oldVal}
                  </span>
                  <span className='text-gray-400'>→</span>
                  <span className='font-bold text-blue-600 truncate max-w-[180px]'>
                    {item.newVal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Verifikasi Khusus (Contoh: Ketik HAPUS) */}
        {config.requireInputMatch && (
          <div className='space-y-1.5 bg-red-50 p-3.5 rounded-2xl border border-red-200'>
            <label className='block text-xs font-semibold text-red-900'>
              Ketik kata{' '}
              <span className='font-mono font-bold text-red-700 bg-white px-1 rounded'>
                {config.requireInputMatch}
              </span>{' '}
              untuk melanjutkan:
            </label>
            <input
              type='text'
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={`Ketik "${config.requireInputMatch}"`}
              className='w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs font-mono font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-600'
            />
          </div>
        )}

        {/* Tombol Aksi Modal */}
        <div className='flex items-center justify-end gap-3 pt-3 border-t border-gray-100'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer'
          >
            {config.cancelLabel || 'Batal'}
          </button>
          <button
            type='button'
            disabled={isConfirmDisabled}
            onClick={() => {
              config.onConfirm();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-40 cursor-pointer ${
              config.confirmButtonClass || 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
