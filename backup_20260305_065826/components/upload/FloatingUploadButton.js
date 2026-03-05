import { useRouter } from 'next/router';
import { useState } from 'react';

export default function FloatingUploadButton() {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Si estamos en upload, no mostramos nada
  if (router.pathname === '/upload') return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Forzar recarga de datos (esto lo manejarán los componentes hijos)
    window.dispatchEvent(new Event('refresh-data'));
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Botón de Actualizar */}
      <div className="relative">
        {showTooltip && (
          <div className="absolute bottom-16 right-0 bg-slate-800 text-white text-sm py-2 px-4 rounded-lg shadow-lg whitespace-nowrap">
            Actualizar datos desde Google Sheets
            <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-800 transform rotate-45"></div>
          </div>
        )}
        <button
          onClick={handleRefresh}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={refreshing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Botón de Upload (oculto por ahora, pero lo dejamos comentado por si acaso) */}
      {/*
      <div className="relative">
        <button
          onClick={() => router.push('/upload')}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      */}
    </div>
  );
}
