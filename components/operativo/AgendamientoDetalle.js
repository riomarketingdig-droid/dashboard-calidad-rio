import SemaforoIndicator from './SemaforoIndicator';

export default function AgendamientoDetalle() {
  // Datos de ejemplo basados en el archivo The one thing Agendamiento.xlsx
  const asesores = [
    { 
      nombre: 'Ceballos Beltrán Juan Manuel', 
      oportunidades: 145, 
      cierres: 98, 
      conversion: 67.6,
      noConformidades: 0,
      snc: 0,
      hallazgosCitas: 0,
      hallazgosCotizacion: 0,
      hallazgosAgendas: 0,
      reincidencias: 0,
      estatus: 'activo'
    },
    { 
      nombre: 'Lopez Fajardo Maria Caridad', 
      oportunidades: 132, 
      cierres: 71, 
      conversion: 53.8,
      noConformidades: 2,
      snc: 1,
      hallazgosCitas: 3,
      hallazgosCotizacion: 2,
      hallazgosAgendas: 1,
      reincidencias: 1,
      estatus: 'observado'
    },
    { 
      nombre: 'Lopez Pérez Atziri Lorena', 
      oportunidades: 108, 
      cierres: 52, 
      conversion: 48.1,
      noConformidades: 3,
      snc: 2,
      hallazgosCitas: 4,
      hallazgosCotizacion: 3,
      hallazgosAgendas: 2,
      reincidencias: 2,
      estatus: 'plan_mejora'
    },
    { 
      nombre: 'Pineda Guzman Hilda Consuelo', 
      oportunidades: 128, 
      cierres: 68, 
      conversion: 53.1,
      noConformidades: 1,
      snc: 1,
      hallazgosCitas: 2,
      hallazgosCotizacion: 1,
      hallazgosAgendas: 1,
      reincidencias: 1,
      estatus: 'observado'
    },
    { 
      nombre: 'Buruel Ortiz Luis Omar', 
      oportunidades: 118, 
      cierres: 62, 
      conversion: 52.5,
      noConformidades: 1,
      snc: 0,
      hallazgosCitas: 1,
      hallazgosCotizacion: 1,
      hallazgosAgendas: 0,
      reincidencias: 0,
      estatus: 'activo'
    },
  ];

  const getEstatusBadge = (estatus) => {
    switch(estatus) {
      case 'activo':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">🟢 Activo</span>;
      case 'observado':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">🟡 Observado</span>;
      case 'plan_mejora':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">🔴 Plan Mejora</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">⚪ Sin datos</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">AGENDAMIENTO - Detalle por Asesor</h3>
        <p className="text-xs text-slate-400 mt-1">Validación obligatoria diaria: 10 auditorías de agendamiento por vendedor</p>
      </div>
      
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <p className="text-xs text-blue-700">
          <span className="font-bold">Regla de reincidencia:</span> 1 vez → retroalimentación-minuta | 2 veces → Incidencia | 3 veces → Acta Administrativa
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-3 font-black text-slate-400 uppercase">Asesor</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Opps</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Cierres</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">% Conv</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">No Conf</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">SNC</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Hall. Citas</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Hall. Cotiz</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Hall. Agendas</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Reincid</th>
              <th className="p-3 font-black text-slate-400 uppercase text-center">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {asesores.map((asesor, index) => (
              <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3 font-medium text-slate-800 whitespace-nowrap">{asesor.nombre}</td>
                <td className="p-3 text-center font-mono">{asesor.oportunidades}</td>
                <td className="p-3 text-center font-mono">{asesor.cierres}</td>
                <td className="p-3 text-center">
                  <span className={`font-mono font-bold ${
                    asesor.conversion >= 60 ? 'text-emerald-600' : asesor.conversion >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {asesor.conversion}%
                  </span>
                </td>
                <td className="p-3 text-center font-mono">{asesor.noConformidades}</td>
                <td className="p-3 text-center font-mono">{asesor.snc}</td>
                <td className="p-3 text-center font-mono">{asesor.hallazgosCitas}</td>
                <td className="p-3 text-center font-mono">{asesor.hallazgosCotizacion}</td>
                <td className="p-3 text-center font-mono">{asesor.hallazgosAgendas}</td>
                <td className="p-3 text-center font-mono">{asesor.reincidencias}</td>
                <td className="p-3 text-center">{getEstatusBadge(asesor.estatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500">Validación obligatoria diaria:</p>
          <ul className="text-xs text-slate-600 mt-1 list-disc list-inside">
            <li>10 auditorías de agendamiento por vendedor</li>
            <li>Formato de revisión de agendas</li>
            <li>Resultado visible el mismo día</li>
            <li>Retroalimentación inmediata</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500">Tablero individual visible:</p>
          <ul className="text-xs text-slate-600 mt-1 list-disc list-inside">
            <li>% error</li>
            <li>% cierre</li>
            <li>Hallazgos</li>
            <li>Reincidencias</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
