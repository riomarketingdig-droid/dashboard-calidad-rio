import { useRouter } from 'next/router';
import { useState } from 'react';

export default function FloatingUploadButton() {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);

  // No mostrar el botón si ya estamos en la página de upload
  if (router.pathname === '/upload') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-slate-800 text-white text-sm py-2 px-4 rounded-lg shadow-lg whitespace-nowrap">
          Subir datos CSV
          <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-800 transform rotate-45"></div>
        </div>
      )}
      <button
        onClick={() => router.push('/upload')}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="bg-slate-800 hover:bg-slate-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
