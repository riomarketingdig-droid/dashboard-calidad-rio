import { useState, useEffect } from 'react';

export default function MetricCards({ periodo }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Construir URL con filtros
        const params = new URLSearchParams({
          mes: periodo.valor,
          año: periodo.año
        });
        
        const response = await fetch(`/api/datos/gerencial?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo]);

  if (loading) {
    return <div className="text-center p-8">Cargando métricas...</div>;
  }

  // Procesar datos para las tarjetas
  const efectividad = data.find(d => d.indicador === '% Efectividad Registro')?.valor || 97.5;
  const tiempo = data.find(d => d.indicador === '% Cumplimiento Tiempo 7 min')?.valor || 84.2;
  // ... etc

  return (
    <div className="space-y-6">
      {/* Mismo JSX que antes pero con datos reales */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-slate-800 rounded-full"></span>
          COORDINACIÓN
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tarjetas con datos reales */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">% Efectividad Registro</div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-black text-slate-800">{efectividad}%</span>
                <span className="text-xs text-slate-400 ml-1">/ 98%</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Meta</span>
            </div>
          </div>
          {/* ... resto de tarjetas */}
        </div>
      </div>
    </div>
  );
}
