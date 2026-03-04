import { useState } from 'react';

export default function FichaTecnica({ colaborador, tipo, seguimientos, recomendaciones, onClose }) {
  const [pestanaActiva, setPestanaActiva] = useState('info');

  // Si es una queja
  if (tipo === 'queja' && colaborador.queja) {
    const q = colaborador.queja;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Detalle de Queja</h2>
              <p className="text-xs text-slate-400">{q.noQuejaCompleto}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Sucursal</p>
                <p className="text-sm font-bold">{q.sucursal}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Proceso</p>
                <p className="text-sm font-bold">{q.proceso}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Status</p>
                <p className={`text-sm font-bold ${q.status === 'CERRADA' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {q.status}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Tiempo Cierre</p>
                <p className="text-sm font-bold">{q.tiempoCierre ? `${q.tiempoCierre} hrs` : 'Pendiente'}</p>
              </div>
            </div>

            {/* Línea de tiempo */}
            <div className="border-l-2 border-slate-200 ml-4 pl-6 space-y-4">
              <div className="relative">
                <div className="absolute -left-9 top-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                <p className="text-xs text-slate-400">Recepción</p>
                <p className="text-sm">{new Date(q.fechaRecepcion).toLocaleString()}</p>
              </div>
              {q.fechaCierre && (
                <div className="relative">
                  <div className="absolute -left-9 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  <p className="text-xs text-slate-400">Cierre</p>
                  <p className="text-sm">{new Date(q.fechaCierre).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Descripción completa */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">📝 Descripción</p>
              <p className="text-sm whitespace-pre-wrap">{q.descripcion}</p>
            </div>

            {/* Causa Raíz */}
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-xs text-red-600 mb-2">🔍 Causa Raíz</p>
              <p className="text-sm">{q.causaRaiz || 'No especificada'}</p>
            </div>

            {/* Plan de Acción */}
            <div className="bg-emerald-50 p-4 rounded-lg">
              <p className="text-xs text-emerald-600 mb-2">📌 Plan de Acción</p>
              <p className="text-sm">{q.planAccion || 'No definido'}</p>
              <p className="text-xs text-emerald-600 mt-2">Responsable: {q.responsablePlan || 'No asignado'}</p>
            </div>

            {/* Metadata adicional */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
              <div><span className="text-slate-400">Empresa:</span> {q.empresa}</div>
              <div><span className="text-slate-400">Procedencia:</span> {q.procedencia}</div>
              <div><span className="text-slate-400">Modalidad:</span> {q.modalidad}</div>
              <div><span className="text-slate-400">CITA:</span> {q.cita}</div>
              <div><span className="text-slate-400">Responsable falla:</span> {q.responsableFalla || 'N/A'}</div>
              <div><span className="text-slate-400"># Acción:</span> {q.accionCorrectiva || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si es colaborador (tu implementación original aquí)
  return (
    <div> {/* Tu implementación original para colaboradores */} </div>
  );
}
