export default function AgendamientoTable() {
  // Datos de ejemplo mensuales
  const monthlyData = [
    { month: 'Ene', oportunidades: 74, cierres: 35, conversion: 94, noConformidades: 5, snc: 3, hallazgos: 8 },
    { month: 'Feb', oportunidades: 75, cierres: 38, conversion: 95, noConformidades: 4, snc: 2, hallazgos: 6 },
    { month: 'Mar', oportunidades: 76, cierres: 42, conversion: 95, noConformidades: 3, snc: 2, hallazgos: 5 },
    { month: 'Abr', oportunidades: 74, cierres: 36, conversion: 94, noConformidades: 5, snc: 3, hallazgos: 7 },
    { month: 'May', oportunidades: 75, cierres: 40, conversion: 95, noConformidades: 4, snc: 2, hallazgos: 5 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">AGENDAMIENTO - Seguimiento Mensual</h3>
        <p className="text-xs text-slate-400 mt-1">Meta Oportunidades: 75% | Meta Cierres: ↓80% | Meta Conversión: 95%</p>
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
              <td className="p-4 font-medium text-slate-800">Oportunidades</td>
              <td className="p-4 text-center font-bold text-slate-600">75%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].oportunidades}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].oportunidades}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].oportunidades}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].oportunidades}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].oportunidades}%</td>
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
              <td className="p-4 font-medium text-slate-800">Cierres</td>
              <td className="p-4 text-center font-bold text-slate-600">↓80%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].cierres}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].cierres}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].cierres}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].cierres}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].cierres}%</td>
              <td className="p-4 text-center">
                <span className="text-emerald-600 text-lg">↓</span>
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                  🟢 Cumple
                </span>
              </td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-4 font-medium text-slate-800">% Conversión</td>
              <td className="p-4 text-center font-bold text-slate-600">95%</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].conversion}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].conversion}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].conversion}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].conversion}%</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].conversion}%</td>
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
              <td className="p-4 font-medium text-slate-800"># No Conformidades</td>
              <td className="p-4 text-center font-bold text-slate-600">0</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].noConformidades}</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].noConformidades}</td>
              <td className="p-4 text-center">
                <span className="text-emerald-600 text-lg">↓</span>
              </td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">
                  🟡 En desarrollo
                </span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50">
              <td className="p-4 font-medium text-slate-800">Hallazgos Auditoría</td>
              <td className="p-4 text-center font-bold text-slate-600">0</td>
              <td className="p-4 text-center font-mono">{monthlyData[0].hallazgos}</td>
              <td className="p-4 text-center font-mono">{monthlyData[1].hallazgos}</td>
              <td className="p-4 text-center font-mono">{monthlyData[2].hallazgos}</td>
              <td className="p-4 text-center font-mono">{monthlyData[3].hallazgos}</td>
              <td className="p-4 text-center font-mono">{monthlyData[4].hallazgos}</td>
              <td className="p-4 text-center">
                <span className="text-emerald-600 text-lg">↓</span>
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
