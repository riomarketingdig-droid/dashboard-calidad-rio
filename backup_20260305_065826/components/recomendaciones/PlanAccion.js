import { useState, useEffect } from 'react';
import TarjetaRecomendacion from './TarjetaRecomendacion';
import ResumenNiveles from './ResumenNiveles';

export default function PlanAccion() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    const fetchRecomendaciones = async () => {
      try {
        const response = await fetch('/api/recomendaciones');
        const data = await response.json();
        setRecomendaciones(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecomendaciones();
  }, []);

  const recomendacionesFiltradas = filtro === 'TODOS' 
    ? recomendaciones 
    : recomendaciones.filter(r => r.nivel === filtro);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <p className="text-center text-slate-400">Cargando recomendaciones personalizadas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResumenNiveles recomendaciones={recomendaciones} />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">📋 RECOMENDACIONES PRIORIZADAS</h2>
            <select 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="text-xs border rounded-lg px-2 py-1"
            >
              <option value="TODOS">Todos los niveles</option>
              <option value="URGENTE">🔴 Urgente</option>
              <option value="CRÍTICO">🟠 Crítico</option>
              <option value="ALTO">🟡 Alto</option>
              <option value="VERDE">🟢 Verde</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Basado en reglas de negocio y reincidencias
          </p>
        </div>
        
        <div className="p-4 max-h-[600px] overflow-y-auto">
          {recomendacionesFiltradas.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              No hay recomendaciones para este nivel
            </p>
          ) : (
            recomendacionesFiltradas.map(rec => (
              <TarjetaRecomendacion key={rec.id} recomendacion={rec} />
            ))
          )}
        </div>
        
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-400 text-center">
          Las recomendaciones se actualizan automáticamente cada 24 horas
        </div>
      </div>
    </div>
  );
}
