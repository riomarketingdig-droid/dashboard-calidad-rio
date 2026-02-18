import SemaforoIndicator from './SemaforoIndicator';

export default function CoordinacionDetalle() {
  // Datos de ejemplo basados en el archivo The one thing Coordinación.xlsx
  const colaboradores = [
    { nombre: 'Ceballos Beltrán Juan Manuel', unidad: 'Central', efectividad: 98.5, tiempo: 6.8, registros: 145, noConformidades: 0, sncLab: 0, hallazgos: 0.5 },
    { nombre: 'Lopez Fajardo Maria Caridad', unidad: 'Norte', efectividad: 95.2, tiempo: 8.2, registros: 132, noConformidades: 2, sncLab: 1, hallazgos: 2.1 },
    { nombre: 'Pineda Guzman Hilda Consuelo', unidad: 'Sur', efectividad: 94.8, tiempo: 8.5, registros: 128, noConformidades: 3, sncLab: 2, hallazgos: 2.8 },
    { nombre: 'Buruel Ortiz Luis Omar', unidad: 'Central', efectividad: 97.1, tiempo: 7.2, registros: 118, noConformidades: 1, sncLab: 0, hallazgos: 0.8 },
    { nombre: 'Lopez Perez Atziri Lorena', unidad: 'Norte', efectividad: 96.3, tiempo: 7.5, registros: 108, noConformidades: 1, sncLab: 1, hallazgos: 1.2 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">COORDINACIÓN - Detalle por Colaborador</h3>
        <p className="text-xs text-slate-400 mt-1">Ritual diario obligatorio (10 minutos) - Revisar quién estuvo debajo de meta y acción correctiva inmediata</p>
      </div>
      
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <p className="text-xs text-blue-700">
          <span className="font-bold">Regla de reincidencia:</span> 1 vez → retroalimentación | 2 veces → plan de mejora | 3 veces → incidencia formal
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Colaborador</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Unidad</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Efectividad</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tiempo Prom. (min)</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Registros</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">No Conf.</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">SNC LAB</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Hallazgos</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((col, index) => (
              <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4 font-medium text-slate-800">{col.nombre}</td>
                <td className="p-4 text-slate-600">{col.unidad}</td>
                <td className="p-4 text-center">
                  <span className={`font-mono font-bold ${
                    col.efectividad >= 98 ? 'text-emerald-600' : col.efectividad >= 95 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {col.efectividad}%
                  </span>
                </td>
                <td className="p-4 text-center font-mono">{col.tiempo}</td>
                <td className="p-4 text-center font-mono">{col.registros}</td>
                <td className="p-4 text-center font-mono">{col.noConformidades}</td>
                <td className="p-4 text-center font-mono">{col.sncLab}</td>
                <td className="p-4 text-center font-mono">{col.hallazgos}%</td>
                <td className="p-4 text-center">
                  <SemaforoIndicator 
                    value={col.efectividad} 
                    type="efectividad" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-bold">Enfoque en velocidad + calidad:</span> Tu sistema debe medir: ✔ correcto | ✔ completo | ✔ en tiempo. Las tres cosas juntas.
        </p>
      </div>
    </div>
  );
}
