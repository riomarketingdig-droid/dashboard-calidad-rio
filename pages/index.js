import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PeriodSelector from '../components/layout/PeriodSelector';
import FloatingUploadButton from '../components/upload/FloatingUploadButton';
import SkeletonTable from '../components/ui/SkeletonTable';
import EmptyState from '../components/ui/EmptyState';
import InfoTooltip from '../components/ui/InfoTooltip';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('gerencial');
  const [gerencialData, setGerencialData] = useState([]);
  const [coordinacionData, setCoordinacionData] = useState([]);
  const [agendamientoData, setAgendamientoData] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [filtroTierCoordinacion, setFiltroTierCoordinacion] = useState(null);
  const [periodo, setPeriodo] = useState({
    tipo: 'year',
    valor: 'Año Completo',
    año: 2025
  });

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [gerencial, coordinacion, agendamiento, recs] = await Promise.all([
        fetch('/api/datos/gerencial').then(res => res.json()),
        fetch('/api/datos/coordinacion').then(res => res.json()),
        fetch('/api/datos/agendamiento').then(res => res.json()),
        fetch('/api/recomendaciones').then(res => res.json())
      ]);
      setGerencialData(gerencial);
      setCoordinacionData(coordinacion);
      setAgendamientoData(agendamiento);
      setRecomendaciones(recs);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar evento de refresh
  useEffect(() => {
    const handleRefresh = () => cargarDatos();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, []);

  // Cargar datos al inicio
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para generar feedback con IA
  const generarFeedbackIA = async (recomendacion) => {
    // Marcar como "generando"
    setRecomendaciones(prev => prev.map(r => 
      r.id === recomendacion.id ? { ...r, generandoFeedback: true } : r
    ));

    try {
      // Extraer valor numérico de la métrica (ej: "43.0% conversión" → 43)
      const valorNumerico = parseFloat(recomendacion.metrica) || 0;
      
      // Determinar tendencia (simulada - idealmente vendría de datos reales)
      const tendencia = Math.random() > 0.5 ? 'up' : 'down';

      const response = await fetch('/api/feedback-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agente: recomendacion.agente,
          metrica: recomendacion.metrica,
          valor: valorNumerico,
          tendencia: tendencia,
          nivel: recomendacion.nivel,
          area: recomendacion.area
        })
      });

      const data = await response.json();
      
      // Actualizar la recomendación con el feedback
      setRecomendaciones(prev => prev.map(r => 
        r.id === recomendacion.id ? { ...r, feedback: data.feedback, generandoFeedback: false } : r
      ));
    } catch (error) {
      console.error('Error:', error);
      setRecomendaciones(prev => prev.map(r => 
        r.id === recomendacion.id ? { ...r, generandoFeedback: false } : r
      ));
    }
  };

  // Filtrar recomendaciones por nivel
  const recomendacionesFiltradas = filtroNivel === 'TODOS' 
    ? recomendaciones 
    : recomendaciones.filter(r => r.nivel === filtroNivel);

  // Filtrar coordinación por tier
  const coordinacionFiltrada = filtroTierCoordinacion 
    ? coordinacionData.filter(c => c.semaforo === filtroTierCoordinacion)
    : coordinacionData;

  // Agrupar datos para las vistas
  const coordinacionResumen = gerencialData.filter(d => d.proceso === 'Coordinación');
  const agendamientoResumen = gerencialData.filter(d => d.proceso === 'Agendamiento');

  const getSemaforoColor = (semaforo) => {
    switch(semaforo) {
      case 'VERDE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'AMARILLO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ROJO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTendenciaIcon = (indicador) => {
    // Aquí iría lógica real comparando con período anterior
    const tendencias = {
      '% Efectividad Registro': 'up',
      '% Cumplimiento Tiempo 7 min': 'up',
      '# No Conformidades': 'down',
      '# Servicio no conformes': 'up',
    };
    const tendencia = tendencias[indicador] || 'neutral';
    return tendencia === 'up' ? '↑' : tendencia === 'down' ? '↓' : '→';
  };

  const getTendenciaColor = (tendencia) => {
    return tendencia === 'up' ? 'text-emerald-600' : tendencia === 'down' ? 'text-red-600' : 'text-slate-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-20 bg-slate-200 rounded-xl mb-6 animate-pulse"></div>
          <div className="h-12 bg-slate-200 rounded-lg mb-6 animate-pulse"></div>
          <SkeletonTable rows={5} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <img src="/Logotipo RIO a color.png" alt="Logo RIO" className="h-12 w-auto object-contain" />
              <div className="border-l pl-4 border-slate-200">
                <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
                  Tablero de Control
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1 tracking-widest uppercase">
                  {activeTab === 'gerencial' ? 'Visión Gerencial' : 
                   activeTab === 'coordinacion' ? 'Detalle Coordinación' :
                   activeTab === 'agendamiento' ? 'Detalle Agendamiento' :
                   'Plan de Acción'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 w-full md:w-auto">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 leading-none">Alcantar Janeth</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Gerente de Calidad</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                AJ
              </div>
            </div>
          </div>
          
          {/* Period Selector (solo en vistas gerenciales) */}
          {activeTab !== 'planaccion' && (
            <div className="mt-4">
              <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} />
            </div>
          )}

          {/* TABS */}
          <nav className="flex space-x-6 mt-4 overflow-x-auto pb-2" aria-label="Tabs">
            {[
              { id: 'gerencial', label: 'VISIÓN GERENCIAL', icon: '📊' },
              { id: 'coordinacion', label: 'COORDINACIÓN', icon: '✓' },
              { id: 'agendamiento', label: 'AGENDAMIENTO', icon: '📅' },
              { id: 'planaccion', label: 'PLAN DE ACCIÓN', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#0066CC] text-[#0066CC]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {activeTab === 'gerencial' && (
          <>
            {/* TARJETAS DE COORDINACIÓN */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#0066CC] rounded-full"></span>
                COORDINACIÓN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {coordinacionResumen.length === 0 ? (
                  <div className="col-span-4">
                    <EmptyState periodo={periodo.valor} tipo={periodo.tipo} />
                  </div>
                ) : (
                  coordinacionResumen.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setActiveTab('coordinacion');
                        setFiltroTierCoordinacion(null);
                      }}
                    >
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-800">{item.valor}%</span>
                          <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                        </div>
                        <span className={`text-lg ${getTendenciaColor(getTendenciaIcon(item.indicador))}`}>
                          {getTendenciaIcon(item.indicador)}
                        </span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                        <span>Meta: {item.meta}</span>
                        <span className="font-medium text-emerald-600">Meta</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TARJETAS DE AGENDAMIENTO */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#0066CC] rounded-full"></span>
                AGENDAMIENTO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {agendamientoResumen.length === 0 ? (
                  <div className="col-span-4">
                    <EmptyState periodo={periodo.valor} tipo={periodo.tipo} />
                  </div>
                ) : (
                  agendamientoResumen.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                      onClick={() => setActiveTab('agendamiento')}
                    >
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-800">
                            {typeof item.valor === 'number' ? item.valor + '%' : item.valor}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                        </div>
                        <span className={`text-lg ${getTendenciaColor(getTendenciaIcon(item.indicador))}`}>
                          {getTendenciaIcon(item.indicador)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TABLA COORDINACIÓN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">COORDINACIÓN - Seguimiento Mensual</h3>
                <p className="text-xs text-slate-400 mt-1">Meta Efectividad: 98% | Meta Tiempo 7min: 85% | Reducción No Conformidades: 30%</p>
              </div>
              <div className="overflow-x-auto">
                {coordinacionResumen.length === 0 ? (
                  <div className="p-8">
                    <EmptyState periodo={periodo.valor} tipo={periodo.tipo} />
                  </div>
                ) : (
                  <table className="w-full text-left min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 text-xs font-black text-slate-400 uppercase">Indicador</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Meta</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Ene</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Feb</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Mar</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Abr</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">May</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center flex items-center gap-1">
                          Tendencia
                          <InfoTooltip content="Comparación vs período anterior. ↑ mejora, ↓ empeora, → estable" />
                        </th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center flex items-center gap-1">
                          Estatus
                          <InfoTooltip content={
                            <div>
                              <p><span className="text-emerald-400">🟢 Cumple:</span> ≥ meta</p>
                              <p><span className="text-amber-400">🟡 En desarrollo:</span> 80-99% de meta</p>
                              <p><span className="text-red-400">🔴 Atención:</span> &lt;80% de meta</p>
                            </div>
                          } />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinacionResumen.map((item, idx) => {
                        const tendencia = getTendenciaIcon(item.indicador);
                        return (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{item.indicador}</td>
                            <td className="p-4 text-center font-bold text-slate-600">{item.meta}</td>
                            <td className="p-4 text-center font-mono">{item.valor}%</td>
                            <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.01)}%</td>
                            <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.02)}%</td>
                            <td className="p-4 text-center font-mono">{Math.round(item.valor * 0.99)}%</td>
                            <td className="p-4 text-center font-mono">{item.valor}%</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 ${getTendenciaColor(tendencia)}`}>
                                {tendencia}
                                <span className="text-[10px]">
                                  {tendencia === '↑' ? '+2%' : tendencia === '↓' ? '-3%' : '0%'}
                                </span>
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                idx < 2 ? 'bg-emerald-100 text-emerald-600' : 
                                idx === 2 ? 'bg-amber-100 text-amber-600' : 
                                'bg-red-100 text-red-600'
                              }`}>
                                {idx < 2 ? '🟢 Cumple' : idx === 2 ? '🟡 En desarrollo' : '🔴 Atención'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* TABLA AGENDAMIENTO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">AGENDAMIENTO - Seguimiento Mensual</h3>
                <p className="text-xs text-slate-400 mt-1">Meta Oportunidades: 75% | Meta Cierres: ↓80% | Meta Conversión: 95%</p>
              </div>
              <div className="overflow-x-auto">
                {agendamientoResumen.length === 0 ? (
                  <div className="p-8">
                    <EmptyState periodo={periodo.valor} tipo={periodo.tipo} />
                  </div>
                ) : (
                  <table className="w-full text-left min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 text-xs font-black text-slate-400 uppercase">Indicador</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Meta</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Ene</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Feb</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Mar</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Abr</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">May</th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center flex items-center gap-1">
                          Tendencia
                          <InfoTooltip content="Comparación vs período anterior. ↑ mejora, ↓ empeora, → estable" />
                        </th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase text-center flex items-center gap-1">
                          Estatus
                          <InfoTooltip content={
                            <div>
                              <p><span className="text-emerald-400">🟢 Cumple:</span> ≥ meta</p>
                              <p><span className="text-amber-400">🟡 En desarrollo:</span> 80-99% de meta</p>
                              <p><span className="text-red-400">🔴 Atención:</span> &lt;80% de meta</p>
                            </div>
                          } />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamientoResumen.map((item, idx) => {
                        const tendencia = getTendenciaIcon(item.indicador);
                        return (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{item.indicador}</td>
                            <td className="p-4 text-center font-bold text-slate-600">{item.meta}</td>
                            <td className="p-4 text-center font-mono">{item.valor}%</td>
                            <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.01)}%</td>
                            <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.02)}%</td>
                            <td className="p-4 text-center font-mono">{Math.round(item.valor * 0.99)}%</td>
                            <td className="p-4 text-center font-mono">{item.valor}%</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 ${getTendenciaColor(tendencia)}`}>
                                {tendencia}
                                <span className="text-[10px]">
                                  {tendencia === '↑' ? '+1%' : tendencia === '↓' ? '-2%' : '0%'}
                                </span>
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                idx < 3 ? 'bg-emerald-100 text-emerald-600' : 
                                idx === 3 ? 'bg-amber-100 text-amber-600' : 
                                'bg-red-100 text-red-600'
                              }`}>
                                {idx < 3 ? '🟢 Cumple' : idx === 3 ? '🟡 En desarrollo' : '🔴 Atención'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'coordinacion' && (
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

            {/* Filtros rápidos por semáforo */}
            <div className="p-4 flex gap-2 border-b border-slate-100 overflow-x-auto">
              <button 
                onClick={() => setFiltroTierCoordinacion(null)}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  filtroTierCoordinacion === null 
                    ? 'bg-[#0066CC] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({coordinacionData.length})
              </button>
              <button 
                onClick={() => setFiltroTierCoordinacion('VERDE')}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  filtroTierCoordinacion === 'VERDE' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                🟢 Excelente ({coordinacionData.filter(c => c.semaforo === 'VERDE').length})
              </button>
              <button 
                onClick={() => setFiltroTierCoordinacion('AMARILLO')}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  filtroTierCoordinacion === 'AMARILLO' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                🟡 En desarrollo ({coordinacionData.filter(c => c.semaforo === 'AMARILLO').length})
              </button>
              <button 
                onClick={() => setFiltroTierCoordinacion('ROJO')}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  filtroTierCoordinacion === 'ROJO' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔴 Atención ({coordinacionData.filter(c => c.semaforo === 'ROJO').length})
              </button>
            </div>

            <div className="overflow-x-auto">
              {coordinacionFiltrada.length === 0 ? (
                <div className="p-8">
                  <EmptyState periodo="este filtro" tipo="filtro" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-black text-slate-400 uppercase">Colaborador</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase">Unidad</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Efectividad</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tiempo Prom.</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Registros</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">No Conf.</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">SNC LAB</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Hallazgos</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center flex items-center gap-1">
                        Semáforo
                        <InfoTooltip content={
                          <div>
                            <p><span className="text-emerald-400">🟢 Excelente:</span> Efectividad ≥98% y Tiempo ≤7min y NoConf=0</p>
                            <p><span className="text-amber-400">🟡 En desarrollo:</span> Efectividad ≥95% o Tiempo ≤8min o NoConf≤2</p>
                            <p><span className="text-red-400">🔴 Atención:</span> No cumple criterios mínimos</p>
                          </div>
                        } />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinacionFiltrada.map((col, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{col.colaborador}</td>
                        <td className="p-4 text-slate-600">{col.unidad}</td>
                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold ${
                            col.efectividadSIO >= 98 ? 'text-emerald-600' : 
                            col.efectividadSIO >= 95 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {col.efectividadSIO.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono">{col.tiempoPromedio.toFixed(1)}</td>
                        <td className="p-4 text-center font-mono">{col.cantidadRegistros}</td>
                        <td className="p-4 text-center font-mono">{col.noConformidades}</td>
                        <td className="p-4 text-center font-mono">{col.sncLab}</td>
                        <td className="p-4 text-center font-mono">{col.efectividadHallazgos.toFixed(1)}%</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getSemaforoColor(col.semaforo)}`}>
                            <span className={`w-2 h-2 rounded-full ${
                              col.semaforo === 'VERDE' ? 'bg-emerald-500' :
                              col.semaforo === 'AMARILLO' ? 'bg-amber-500' : 'bg-red-500'
                            }`}></span>
                            {col.semaforo === 'VERDE' ? 'Excelente' : 
                             col.semaforo === 'AMARILLO' ? 'En desarrollo' : 'Atención'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                <span className="font-bold">Enfoque en velocidad + calidad:</span> Tu sistema debe medir: ✔ correcto | ✔ completo | ✔ en tiempo. Las tres cosas juntas.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'agendamiento' && (
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
              {agendamientoData.length === 0 ? (
                <div className="p-8">
                  <EmptyState periodo="actual" tipo="datos" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-black text-slate-400 uppercase">Asesor</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Opps</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Cierres</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Conv</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">No Conf</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">SNC</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Hall. Citas</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Hall. Cotiz</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Hall. Agendas</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Reincid</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamientoData.map((asesor, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{asesor.asesor}</td>
                        <td className="p-4 text-center font-mono">{asesor.oportunidades}</td>
                        <td className="p-4 text-center font-mono">{asesor.cierres}</td>
                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold ${
                            asesor.conversion >= 60 ? 'text-emerald-600' : 
                            asesor.conversion >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {asesor.conversion.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono">{asesor.noConformidades}</td>
                        <td className="p-4 text-center font-mono">{asesor.snc}</td>
                        <td className="p-4 text-center font-mono">{asesor.hallazgosCitas}</td>
                        <td className="p-4 text-center font-mono">{asesor.hallazgosCotizacion}</td>
                        <td className="p-4 text-center font-mono">{asesor.hallazgosAgendas}</td>
                        <td className="p-4 text-center font-mono">{asesor.reincidencias}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            asesor.estatus === 'Activo' ? 'bg-emerald-100 text-emerald-600' :
                            asesor.estatus === 'Observado' ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {asesor.estatus === 'Activo' ? '🟢 Activo' :
                             asesor.estatus === 'Observado' ? '🟡 Observado' :
                             '🔴 Plan Mejora'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        )}

        {activeTab === 'planaccion' && (
          <div className="space-y-6">
            {/* Planes de acción por nivel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">📊 PLANES DE ACCIÓN POR NIVEL</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { nivel: 'URGENTE', color: 'red', accion: 'Intervención diaria', meta: 'Subir a amarillo en 2 semanas', count: recomendaciones.filter(r => r.nivel === 'URGENTE').length },
                  { nivel: 'CRÍTICO', color: 'orange', accion: 'Coaching intensivo', meta: 'Subir a amarillo en 3 semanas', count: recomendaciones.filter(r => r.nivel === 'CRÍTICO').length },
                  { nivel: 'ALTO', color: 'amber', accion: 'Coaching semanal', meta: 'Subir a verde en 1 mes', count: recomendaciones.filter(r => r.nivel === 'ALTO').length },
                  { nivel: 'VERDE', color: 'emerald', accion: 'Mentoría a otros', meta: 'Mantener y compartir', count: recomendaciones.filter(r => r.nivel === 'VERDE').length },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border ${
                      item.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' :
                      item.nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' :
                      item.nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' :
                      'bg-emerald-50 border-emerald-200'
                    } cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => setFiltroNivel(item.nivel)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-black uppercase ${
                        item.nivel === 'URGENTE' ? 'text-red-600' :
                        item.nivel === 'CRÍTICO' ? 'text-orange-600' :
                        item.nivel === 'ALTO' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>{item.nivel}</span>
                      <span className={`text-sm font-bold ${
                        item.nivel === 'URGENTE' ? 'text-red-600' :
                        item.nivel === 'CRÍTICO' ? 'text-orange-600' :
                        item.nivel === 'ALTO' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>{item.count}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700">{item.accion}</p>
                    <p className="text-[10px] text-slate-500 mt-2">{item.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones priorizadas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">📋 RECOMENDACIONES PRIORIZADAS</h2>
                  <select 
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
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
                  <div className="p-8">
                    <EmptyState periodo="este nivel" tipo="filtro" />
                  </div>
                ) : (
                  recomendacionesFiltradas.map(rec => (
                    <div key={rec.id} className={`mb-3 p-4 rounded-xl border ${
                      rec.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' :
                      rec.nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' :
                      rec.nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' :
                      'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            rec.nivel === 'URGENTE' ? 'bg-red-600' :
                            rec.nivel === 'CRÍTICO' ? 'bg-orange-500' :
                            rec.nivel === 'ALTO' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          <span className="text-xs font-black uppercase">{rec.nivel}</span>
                        </div>
                        <span className="text-[10px] bg-white px-2 py-1 rounded-full border">
                          {rec.area}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 mb-1">{rec.agente}</h4>
                      <p className="text-xs text-slate-600 mb-2">{rec.metrica}</p>
                      
                      <div className="bg-white/50 rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium mb-1">▶ {rec.sugerencia}</p>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>👤 {rec.responsable}</span>
                          <span>⏱️ {rec.plazo}</span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 flex justify-between items-center mb-2">
                        <span>📅 Límite: {rec.fechaLimite}</span>
                      </div>

                      {/* Botón de IA */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => generarFeedbackIA(rec)}
                          disabled={rec.generandoFeedback}
                          className="text-xs bg-[#0066CC] hover:bg-[#0052a3] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${rec.generandoFeedback ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {rec.generandoFeedback ? 'Generando...' : 'Generar Feedback con IA'}
                        </button>
                      </div>

                      {/* Feedback generado */}
                      {rec.feedback && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-700 italic">"{rec.feedback}"</p>
                          <p className="text-[9px] text-slate-400 mt-1 text-right">Generado por Gemini AI</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-400 text-center">
                Las recomendaciones se actualizan automáticamente desde Google Sheets
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BUTTON (actualizar) */}
      <FloatingUploadButton />

      {/* FOOTER */}
      <footer className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[3px] pb-4">
        Análisis Integral de Desempeño · Recomendaciones basadas en IA
      </footer>
    </div>
  );
}
