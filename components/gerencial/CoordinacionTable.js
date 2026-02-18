export default function CoordinacionTable() {
  // Datos de ejemplo mensuales
  const monthlyData = [
    { month: 'Enero', efectividad: 97, tiempo: 82, noConformidades: 12, snc: 8, tendencia: 'up' },
    { month: 'Febrero', efectividad: 98, tiempo: 84, noConformidades: 10, snc: 7, tendencia: 'up' },
    { month: 'Marzo', efectividad: 98, tiempo: 86, noConformidades: 8, snc: 6, tendencia: 'up' },
    { month: 'Abril', efectividad: 97, tiempo: 83, noConformidades: 11, snc: 8, tendencia: 'down' },
    { month: 'Mayo', efectividad: 98, tiempo: 85, noConformidades: 9, snc: 6, tendencia: 'up' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">COORDINACIÓN - Seguimiento Mensual</h3>
        <p className="text-xs text-slate-400 mt-1">Meta Efectividad: 98% | Meta Tiempo 7min: 85% | Reducción No Conformidades: 30%</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Indicador</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Meta</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Ene</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Feb</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Mar</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Abr</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">May</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tendencia</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-4 font-medium text-slate-800">% Efectividad Registro</td>
              <td className="p-4 text-center font-bold text-slate-600">98%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].efectividad}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].efectividad}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].efectividad}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].efectividad}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].efectividad}%</td>
              <td className="p-4 text-center">
                <span className="text-emerald-600 text-lg">↑</span>
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                  🟢 Cumple
                </span>
              </td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-4 font-medium text-slate-800">% Cumplimiento Tiempo 7min</td>
              <td className="p-4 text-center font-bold text-slate-600">85%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].tiempo}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].tiempo}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].tiempo}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].tiempo}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].tiempo}%</td>
              <td className="p-4 text-center">
                <span className="text-emerald-600 text-lg">↑</span>
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">
                  🟡 En desarrollo
                </span>
              </td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-4 font-medium text-slate-800"># No Conformidades</td>
              <td className="p-4 text-center font-bold text-slate-600">↓30%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].noConformidades}</td>
              <td className="p-4 text-center">
                <span className="text-emerald-600 text-lg">↓</span>
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                  🟢 Cumple
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-medium text-slate-800"># Servicio no conformes</td>
              <td className="p-4 text-center font-bold text-slate-600">↓30%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].snc}</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].snc}</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].snc}</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].snc}</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].snc}</td>
              <td className="p-4 text-center">
                <span className="text-red-600 text-lg">↑</span>
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                  🔴 Atención
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
