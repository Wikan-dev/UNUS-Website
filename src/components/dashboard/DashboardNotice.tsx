import type { ReactElement } from 'react';

interface DashboardNoticeProps {
  successNotice: string | null;
  error: string | null;
  onClearSuccess: () => void;
  onClearError: () => void;
}

export default function DashboardNotice({
  successNotice,
  error,
  onClearSuccess,
  onClearError,
}: DashboardNoticeProps): ReactElement | null {
  if (!successNotice && !error) return null;

  return (
    <div className='space-y-3'>
      {successNotice && (
        <div className='flex items-center justify-between p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl shadow-sm animate-fade-in'>
          <div className='flex items-center gap-3'>
            <svg
              className='w-6 h-6 text-emerald-600 shrink-0'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='text-sm font-medium'>{successNotice}</span>
          </div>
          <button
            type='button'
            onClick={onClearSuccess}
            className='text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer'
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className='flex items-center justify-between p-4 bg-red-50 border border-red-300 text-red-800 rounded-2xl shadow-sm'>
          <div className='flex items-center gap-3'>
            <svg
              className='w-6 h-6 text-red-600 shrink-0'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
            </svg>
            <span className='text-sm font-medium'>{error}</span>
          </div>
          <button
            type='button'
            onClick={onClearError}
            className='text-red-700 hover:text-red-900 font-bold p-1 cursor-pointer'
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
