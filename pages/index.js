import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PeriodSelector from '../components/layout/PeriodSelector';
import FloatingUploadButton from '../components/upload/FloatingUploadButton';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('gerencial');
  const [gerencialData, setGerencialData] = useState([]);
  const [coordinacionData, setCoordinacionData] = useState([]);
  const [agendamientoData, setAgendamientoData] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTier, setFiltroTier] = useState(null);
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

  // Agrupar datos para las vistas
  const coordinacionResumen = gerencialData.filter(d => d.proceso === 'Coordinación');
  const agendamientoResumen = gerencialData.filter(d => d.proceso === 'Agendamiento');

  // Filtrar datos de coordinación si hay filtro de tier
  const coordinacionFiltrada = filtroTier 
    ? coordinacionData.filter(c => c.semaforo === filtroTier)
    : coordinacionData;

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
    // Por ahora usamos ejemplo
    const tendencias = {
      '% Efectividad Registro': 'up',
      '% Cumplimiento Tiempo 7 min': 'up',
      '# No Conformidades': 'down',
      '# Servicio no conformes': 'up',
    };
    const tendencia = tendencias[indicador] || 'neutral';
    return tendencia === 'up' ? '↑' : tendencia === 'down' ? '↓' : '→';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos desde Google Sheets...</p>
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
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Coordinadora</p>
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
            <button
              onClick={() => setActiveTab('gerencial')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'gerencial'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📊 VISIÓN GERENCIAL
            </button>
            <button
              onClick={() => setActiveTab('coordinacion')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'coordinacion'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ✓ COORDINACIÓN
            </button>
            <button
              onClick={() => setActiveTab('agendamiento')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'agendamiento'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📅 AGENDAMIENTO
            </button>
            <button
              onClick={() => setActiveTab('planaccion')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'planaccion'
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              🎯 PLAN DE ACCIÓN
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-4 md:p-6">
        {activeTab === 'gerencial' && (
          <>
            {/* TARJETAS DE COORDINACIÓN con hover */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-800 rounded-full"></span>
                COORDINACIÓN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {coordinacionResumen.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setActiveTab('coordinacion');
                      setFiltroTier(null);
                    }}
                  >
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-black text-slate-800">{item.valor}%</span>
                        <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                      </div>
                      <span className={`text-lg ${getTendenciaIcon(item.indicador) === '↑' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {getTendenciaIcon(item.indicador)}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                      <span>Meta: {item.meta}</span>
                      <span className="font-medium text-emerald-600">Meta</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TARJETAS DE AGENDAMIENTO */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-800 rounded-full"></span>
                AGENDAMIENTO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {agendamientoResumen.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setActiveTab('agendamiento');
                    }}
                  >
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-black text-slate-800">
                          {typeof item.valor === 'number' ? item.valor + '%' : item.valor}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                      </div>
                      <span className={`text-lg ${getTendenciaIcon(item.indicador) === '↑' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {getTendenciaIcon(item.indicador)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TABLA COORDINACIÓN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">COORDINACIÓN - Seguimiento Mensual</h3>
                <p className="text-xs text-slate-400 mt-1">Meta Efectividad: 98% | Meta Tiempo 7min: 85% | Reducción No Conformidades: 30%</p>
              </div>
              <div className="overflow-x-auto">
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
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tendencia</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinacionResumen.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{item.indicador}</td>
                        <td className="p-4 text-center font-bold text-slate-600">{item.meta}</td>
                        <td className="p-4 text-center font-mono">{item.valor}%</td>
                        <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.01)}%</td>
                        <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.02)}%</td>
                        <td className="p-4 text-center font-mono">{Math.round(item.valor * 0.99)}%</td>
                        <td className="p-4 text-center font-mono">{item.valor}%</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 ${
                            getTendenciaIcon(item.indicador) === '↑' ? 'text-emerald-600' : 
                            getTendenciaIcon(item.indicador) === '↓' ? 'text-red-600' : 'text-slate-400'
                          }`}>
                            {getTendenciaIcon(item.indicador)}
                            <span className="text-[10px]">
                              {getTendenciaIcon(item.indicador) === '↑' ? '+2%' : 
                               getTendenciaIcon(item.indicador) === '↓' ? '-3%' : '0%'}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLA AGENDAMIENTO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">AGENDAMIENTO - Seguimiento Mensual</h3>
                <p className="text-xs text-slate-400 mt-1">Meta Oportunidades: 75% | Meta Cierres: ↓80% | Meta Conversión: 95%</p>
              </div>
              <div className="overflow-x-auto">
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
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tendencia</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamientoResumen.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{item.indicador}</td>
                        <td className="p-4 text-center font-bold text-slate-600">{item.meta}</td>
                        <td className="p-4 text-center font-mono">{item.valor}%</td>
                        <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.01)}%</td>
                        <td className="p-4 text-center font-mono">{Math.round(item.valor * 1.02)}%</td>
                        <td className="p-4 text-center font-mono">{Math.round(item.valor * 0.99)}%</td>
                        <td className="p-4 text-center font-mono">{item.valor}%</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 ${
                            getTendenciaIcon(item.indicador) === '↑' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {getTendenciaIcon(item.indicador)}
                            <span className="text-[10px]">
                              {getTendenciaIcon(item.indicador) === '↑' ? '+1%' : '-2%'}
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
                    ))}
                  </tbody>
                </table>
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
            <div className="p-4 flex gap-2 border-b border-slate-100">
              <button 
                onClick={() => setFiltroTier(null)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filtroTier === null 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFiltroTier('VERDE')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filtroTier === 'VERDE' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                🟢 Excelente
              </button>
              <button 
                onClick={() => setFiltroTier('AMARILLO')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filtroTier === 'AMARILLO' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                🟡 En desarrollo
              </button>
              <button 
                onClick={() => setFiltroTier('ROJO')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filtroTier === 'ROJO' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔴 Atención
              </button>
            </div>

            <div className="overflow-x-auto">
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
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Semáforo</th>
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
                          {col.semaforo}
                        </span>
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
                  <div key={idx} className={`p-4 rounded-lg border bg-${item.color}-50 border-${item.color}-200`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-black uppercase text-${item.color}-600`}>{item.nivel}</span>
                      <span className={`text-sm font-bold text-${item.color}-600`}>{item.count}</span>
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
                    className="text-xs border rounded-lg px-2 py-1"
                    defaultValue="TODOS"
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
              
              <div className="p-4 max-h-[500px] overflow-y-auto">
                {recomendaciones.map(rec => (
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
                    
                    <div className="text-[10px] text-slate-500 flex justify-between items-center">
                      <span>📅 Límite: {rec.fechaLimite}</span>
                    </div>
                  </div>
                ))}
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
