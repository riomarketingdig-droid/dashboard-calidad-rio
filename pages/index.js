import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PeriodSelector from '../components/layout/PeriodSelector';
import FloatingUploadButton from '../components/upload/FloatingUploadButton';
import SkeletonTable from '../components/ui/SkeletonTable';
import InfoTooltip from '../components/ui/InfoTooltip';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('gerencial');
  
  // Estados para datos
  const [gerencialData, setGerencialData] = useState([]);
  const [coordinacionData, setCoordinacionData] = useState([]);
  const [agendamientoData, setAgendamientoData] = useState([]);
  const [satisfaccionData, setSatisfaccionData] = useState([]);
  const [visionGerencial, setVisionGerencial] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [filtrosSatisfaccion, setFiltrosSatisfaccion] = useState({
    sucursal: 'TODAS',
    proceso: 'TODOS',
    status: 'TODOS',
    mes: 'TODOS',
    semana: 'TODAS'
  });
  
  const [filtroTierCoordinacion, setFiltroTierCoordinacion] = useState(null);
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [periodo, setPeriodo] = useState({
    tipo: 'year',
    valor: 'Año Completo',
    año: 2025
  });

  // Estado para seguimiento IA
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [recomendacionesCompletadas, setRecomendacionesCompletadas] = useState([]);

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        gerencial, 
        coordinacion, 
        agendamiento, 
        satisfaccion, 
        vision,
        recs
      ] = await Promise.all([
        fetch('/api/datos/gerencial').then(res => res.json()),
        fetch('/api/datos/coordinacion').then(res => res.json()),
        fetch('/api/datos/agendamiento').then(res => res.json()),
        fetch('/api/datos/satisfaccion').then(res => res.json()),
        fetch('/api/datos/vision-gerencial').then(res => res.json()),
        fetch('/api/recomendaciones').then(res => res.json())
      ]);
      
      setGerencialData(gerencial);
      setCoordinacionData(coordinacion);
      setAgendamientoData(agendamiento);
      setSatisfaccionData(satisfaccion);
      setVisionGerencial(vision);
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
    setRecomendaciones(prev => prev.map(r => 
      r.id === recomendacion.id ? { ...r, generandoFeedback: true } : r
    ));

    try {
      const valorNumerico = parseFloat(recomendacion.metrica) || 0;
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

      if (!response.ok) throw new Error('Error en la API');
      const data = await response.json();
      
      setRecomendaciones(prev => prev.map(r => 
        r.id === recomendacion.id ? { ...r, feedback: data.feedback, generandoFeedback: false } : r
      ));

      setTimeout(() => {
        const elemento = document.getElementById(`recomendacion-${recomendacion.id}`);
        if (elemento) elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      setRecomendaciones(prev => prev.map(r => 
        r.id === recomendacion.id ? { ...r, generandoFeedback: false } : r
      ));
      alert('Error al generar feedback. Por favor intenta de nuevo.');
    }
  };

  // Función para marcar completada una recomendación
  const marcarCompletada = (id) => {
    setRecomendacionesCompletadas(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // Filtrar satisfacción
  const satisfaccionFiltrada = satisfaccionData.filter(q => {
    if (filtrosSatisfaccion.sucursal !== 'TODAS' && q.Sucursal !== filtrosSatisfaccion.sucursal) return false;
    if (filtrosSatisfaccion.proceso !== 'TODOS' && q.Proceso !== filtrosSatisfaccion.proceso) return false;
    if (filtrosSatisfaccion.status !== 'TODOS' && q.Status !== filtrosSatisfaccion.status) return false;
    if (filtrosSatisfaccion.mes !== 'TODOS' && q.Mes !== filtrosSatisfaccion.mes) return false;
    if (filtrosSatisfaccion.semana !== 'TODAS' && q.Semana !== filtrosSatisfaccion.semana) return false;
    return true;
  });

  // Calcular tiempo de cierre (si no viene calculado)
  const quejasConTiempo = satisfaccionFiltrada.map(q => ({
    ...q,
    tiempoCierre: q['Tiempo de cierre (horas)'] || 
      (q['Fecha de cierre'] && q['Fecha de recepción de la queja'] 
        ? Math.round((new Date(q['Fecha de cierre']) - new Date(q['Fecha de recepción de la queja'])) / (1000 * 60 * 60))
        : 'N/A')
  }));

  // Métricas de satisfacción
  const metricasSatisfaccion = {
    npsPromedio: visionGerencial.find(v => v.Indicador === 'NPS Promedio (Satisfacción)')?.Valor || 8.5,
    felicitaciones: visionGerencial.find(v => v.Indicador === '% Felicitaciones Clientes')?.Valor || 92,
    quejasAbiertas: quejasConTiempo.filter(q => q.Status !== 'CERRADA').length,
    tiempoPromedioCierre: Math.round(
      quejasConTiempo
        .filter(q => typeof q.tiempoCierre === 'number')
        .reduce((acc, q) => acc + q.tiempoCierre, 0) / 
      (quejasConTiempo.filter(q => typeof q.tiempoCierre === 'number').length || 1)
    )
  };

  // Estado de expansión de fichas
  const [fichaExpandida, setFichaExpandida] = useState(null);

  // Obtener opciones únicas para filtros
  const opcionesSucursales = ['TODAS', ...new Set(satisfaccionData.map(q => q.Sucursal).filter(Boolean))];
  const opcionesProcesos = ['TODOS', ...new Set(satisfaccionData.map(q => q.Proceso).filter(Boolean))];
  const opcionesStatus = ['TODOS', ...new Set(satisfaccionData.map(q => q.Status).filter(Boolean))];
  const opcionesMeses = ['TODOS', ...new Set(satisfaccionData.map(q => q.Mes).filter(Boolean))];
  const opcionesSemanas = ['TODAS', ...new Set(satisfaccionData.map(q => q['Semana del año']).filter(Boolean))];

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
                   activeTab === 'satisfaccion' ? 'Satisfacción Cliente' :
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
          {activeTab === 'gerencial' && (
            <div className="mt-4">
              <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} />
            </div>
          )}

          {/* TABS */}
          <nav className="flex space-x-4 mt-4 overflow-x-auto pb-2" aria-label="Tabs">
            {[
              { id: 'gerencial', label: 'VISIÓN GERENCIAL', icon: '📊' },
              { id: 'coordinacion', label: 'COORDINACIÓN', icon: '✓' },
              { id: 'agendamiento', label: 'AGENDAMIENTO', icon: '📅' },
              { id: 'satisfaccion', label: 'SATISFACCIÓN', icon: '😊' },
              { id: 'planaccion', label: 'PLAN DE ACCIÓN', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
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
      <main className="p-4 md:p-6">
        {/* VISTA GERENCIAL */}
        {activeTab === 'gerencial' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">VISIÓN GERENCIAL - Seguimiento Mensual</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Indicador</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Proceso</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Meta</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Ene</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Feb</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Mar</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Abr</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">May</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Jun</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Jul</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Ago</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Sep</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Oct</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Nov</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Dic</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tendencia</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Responsable</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {visionGerencial.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{item.Indicador}</td>
                      <td className="p-4 text-center text-slate-600">{item.Proceso}</td>
                      <td className="p-4 text-center font-bold text-slate-600">{item.Meta}</td>
                      <td className="p-4 text-center font-mono">{item.Enero}</td>
                      <td className="p-4 text-center font-mono">{item.Febrero}</td>
                      <td className="p-4 text-center font-mono">{item.Marzo}</td>
                      <td className="p-4 text-center font-mono">{item.Abril}</td>
                      <td className="p-4 text-center font-mono">{item.Mayo}</td>
                      <td className="p-4 text-center font-mono">{item.Junio}</td>
                      <td className="p-4 text-center font-mono">{item.Julio}</td>
                      <td className="p-4 text-center font-mono">{item.Agosto}</td>
                      <td className="p-4 text-center font-mono">{item.Septiembre}</td>
                      <td className="p-4 text-center font-mono">{item.Octubre}</td>
                      <td className="p-4 text-center font-mono">{item.Noviembre}</td>
                      <td className="p-4 text-center font-mono">{item.Diciembre}</td>
                      <td className="p-4 text-center">{item.Tendencia}</td>
                      <td className="p-4 text-center">{item.Responsable}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          item.Estatus === 'Cumple' ? 'bg-emerald-100 text-emerald-600' :
                          item.Estatus === 'En desarrollo' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {item.Estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA COORDINACIÓN */}
        {activeTab === 'coordinacion' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">COORDINACIÓN - Detalle por Colaborador</h3>
              <p className="text-xs text-slate-400 mt-1">Ritual diario obligatorio (10 minutos)</p>
            </div>
            
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-bold">Regla de reincidencia:</span> 1 vez → retroalimentación | 2 veces → plan de mejora | 3 veces → incidencia formal
              </p>
            </div>

            {/* Filtros rápidos */}
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
                🟢 Excelente ({coordinacionData.filter(c => c.SEMAFORO === 'VERDE').length})
              </button>
              <button 
                onClick={() => setFiltroTierCoordinacion('AMARILLO')}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  filtroTierCoordinacion === 'AMARILLO' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                🟡 En desarrollo ({coordinacionData.filter(c => c.SEMAFORO === 'AMARILLO').length})
              </button>
              <button 
                onClick={() => setFiltroTierCoordinacion('ROJO')}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  filtroTierCoordinacion === 'ROJO' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                🔴 Atención ({coordinacionData.filter(c => c.SEMAFORO === 'ROJO').length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Colaborador</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Unidad</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">FTR</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Tiempo Prom.</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Registros</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">No Conf.</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">SNC</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Semáforo</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtroTierCoordinacion 
                    ? coordinacionData.filter(c => c.SEMAFORO === filtroTierCoordinacion)
                    : coordinacionData
                  ).map((col, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{col.Colaborador}</td>
                      <td className="p-4 text-slate-600">{col.Unidad}</td>
                      <td className="p-4 text-center font-mono">{col['FTR (Porcentaje de órdenes registradas bien a la primera)']}%</td>
                      <td className="p-4 text-center font-mono">{col['Tiempo Promedio de registro']}</td>
                      <td className="p-4 text-center font-mono">{col['Cantidad de registros']}</td>
                      <td className="p-4 text-center font-mono">{col['No. de no conformidades']}</td>
                      <td className="p-4 text-center font-mono">{col.SNC}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          col.SEMAFORO === 'VERDE' ? 'bg-emerald-100 text-emerald-700' :
                          col.SEMAFORO === 'AMARILLO' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            col.SEMAFORO === 'VERDE' ? 'bg-emerald-500' :
                            col.SEMAFORO === 'AMARILLO' ? 'bg-amber-500' : 'bg-red-500'
                          }`}></span>
                          {col.SEMAFORO}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA AGENDAMIENTO */}
        {activeTab === 'agendamiento' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">AGENDAMIENTO - Detalle por Asesor</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Asesor</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Citas</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Oport.</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Hall. Cotiz</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Hall. Venta</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Efect. Aud.</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">SNC</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">No Conf.</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">% Efect. Agend.</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Estatus</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamientoData.map((asesor, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{asesor.Asesor}</td>
                      <td className="p-4 text-center font-mono">{asesor['No. citas agendadas']}</td>
                      <td className="p-4 text-center font-mono">{asesor['% Oportunidades aprovechadas']}%</td>
                      <td className="p-4 text-center font-mono">{asesor['Hallazgos cotización %']}%</td>
                      <td className="p-4 text-center font-mono">{asesor['No. Hallazgos en labor de venta%']}%</td>
                      <td className="p-4 text-center font-mono">{asesor['% de efectividad en Hallazgos de auditoría citas']}%</td>
                      <td className="p-4 text-center font-mono">{asesor['NO. SNC']}</td>
                      <td className="p-4 text-center font-mono">{asesor['No conformidades']}</td>
                      <td className="p-4 text-center font-mono">{asesor['% efectividad Agendamiento']}%</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          asesor.Estatus === 'A' ? 'bg-emerald-100 text-emerald-600' :
                          asesor.Estatus === 'B' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {asesor.Estatus}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono">{asesor['Score Total']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA SATISFACCIÓN CLIENTE - Formato Ficha Técnica */}
        {activeTab === 'satisfaccion' && (
          <div className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">NPS Promedio</div>
                <div className="text-3xl font-black text-slate-800">{metricasSatisfaccion.npsPromedio}</div>
                <div className="mt-2 text-[10px] text-slate-400">Meta: 9</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">% Felicitaciones</div>
                <div className="text-3xl font-black text-emerald-600">{metricasSatisfaccion.felicitaciones}%</div>
                <div className="mt-2 text-[10px] text-slate-400">Meta: 90%</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Quejas Abiertas</div>
                <div className="text-3xl font-black text-amber-600">{metricasSatisfaccion.quejasAbiertas}</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Tiempo Prom. Cierre</div>
                <div className="text-3xl font-black text-slate-800">{metricasSatisfaccion.tiempoPromedioCierre} hrs</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">🔍 Filtrar quejas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <select 
                  value={filtrosSatisfaccion.sucursal}
                  onChange={(e) => setFiltrosSatisfaccion({...filtrosSatisfaccion, sucursal: e.target.value})}
                  className="text-xs border rounded-lg px-3 py-2"
                >
                  {opcionesSucursales.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <select 
                  value={filtrosSatisfaccion.proceso}
                  onChange={(e) => setFiltrosSatisfaccion({...filtrosSatisfaccion, proceso: e.target.value})}
                  className="text-xs border rounded-lg px-3 py-2"
                >
                  {opcionesProcesos.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <select 
                  value={filtrosSatisfaccion.status}
                  onChange={(e) => setFiltrosSatisfaccion({...filtrosSatisfaccion, status: e.target.value})}
                  className="text-xs border rounded-lg px-3 py-2"
                >
                  {opcionesStatus.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <select 
                  value={filtrosSatisfaccion.mes}
                  onChange={(e) => setFiltrosSatisfaccion({...filtrosSatisfaccion, mes: e.target.value})}
                  className="text-xs border rounded-lg px-3 py-2"
                >
                  {opcionesMeses.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                <select 
                  value={filtrosSatisfaccion.semana}
                  onChange={(e) => setFiltrosSatisfaccion({...filtrosSatisfaccion, semana: e.target.value})}
                  className="text-xs border rounded-lg px-3 py-2"
                >
                  {opcionesSemanas.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
            </div>

            {/* Listado de quejas en formato ficha */}
            <div className="space-y-3">
              {quejasConTiempo.length === 0 ? (
                <EmptyState periodo="filtros seleccionados" tipo="filtro" />
              ) : (
                quejasConTiempo.map((queja, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Cabecera de la ficha (siempre visible) */}
                    <div 
                      className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setFichaExpandida(fichaExpandida === idx ? null : idx)}
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs font-black text-slate-400">{queja['NO. DE QUEJA']}</span>
                        <span className="text-sm font-medium">{queja.Sucursal}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white border">
                          {queja.Proceso}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          queja.Status === 'CERRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {queja.Status}
                        </span>
                        <span className="text-xs text-slate-500">
                          ⏱️ {typeof queja.tiempoCierre === 'number' ? `${queja.tiempoCierre} hrs` : queja.tiempoCierre}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        {fichaExpandida === idx ? '▼' : '▶'}
                      </div>
                    </div>

                    {/* Detalle expandido */}
                    {fichaExpandida === idx && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">📅 Fecha recepción</p>
                            <p className="font-medium">{new Date(queja['Fecha de recepción de la queja']).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">🏢 Empresa</p>
                            <p className="font-medium">{queja.Empresa}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">📍 Procedencia</p>
                            <p className="font-medium">{queja['Procedencia de la queja (de donde llegó la queja)']}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">📋 Subproceso</p>
                            <p className="font-medium">{queja['Sub proceso']}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">⚠️ Motivo</p>
                            <p className="font-medium">{queja['Motivo General del catálogo']}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">👤 Responsable falla</p>
                            <p className="font-medium">{queja['Responsable de la falla'] || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-400 mb-1">📝 Descripción</p>
                          <p className="text-sm">{queja['Descripción de queja paciente']}</p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">🔍 Causa Raíz</p>
                          <p className="text-sm">{queja['Causa Raíz (documentar para presentación)']}</p>
                        </div>

                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <p className="text-xs text-emerald-600 mb-1">📌 Plan de Acción</p>
                          <p className="text-sm">{queja['PLAN DE ACCION PARA EVITAR RECURRENCIA (Teams)']}</p>
                          <p className="text-xs text-emerald-600 mt-2">Responsable: {queja['Responsable de plan de acción'] || 'N/A'}</p>
                        </div>

                        <div className="flex justify-between text-xs text-slate-400 pt-2 border-t">
                          <span>🆔 CITA: {queja.CITA}</span>
                          <span>📁 MODALIDAD: {queja['MODALIDAD DE LA QUEJA']}</span>
                          <span>🎫 # acción: {queja['# de acción correctiva/ticket']}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA PLAN DE ACCIÓN */}
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
                {(filtroNivel === 'TODOS' ? recomendaciones : recomendaciones.filter(r => r.nivel === filtroNivel)).length === 0 ? (
                  <EmptyState periodo="este nivel" tipo="filtro" />
                ) : (
                  (filtroNivel === 'TODOS' ? recomendaciones : recomendaciones.filter(r => r.nivel === filtroNivel)).map(rec => (
                    <div 
                      key={rec.id} 
                      id={`recomendacion-${rec.id}`}
                      className={`mb-3 p-4 rounded-xl border transition-all ${
                        recomendacionesCompletadas.includes(rec.id)
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : rec.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' :
                            rec.nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' :
                            rec.nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' :
                            'bg-emerald-50 border-emerald-200'
                      }`}
                    >
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

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => marcarCompletada(rec.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                            recomendacionesCompletadas.includes(rec.id)
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {recomendacionesCompletadas.includes(rec.id) ? 'Completado' : 'Marcar hecho'}
                        </button>
                        <button
                          onClick={() => generarFeedbackIA(rec)}
                          disabled={rec.generandoFeedback}
                          className="text-xs bg-[#0066CC] hover:bg-[#0052a3] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${rec.generandoFeedback ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {rec.generandoFeedback ? 'Generando...' : 'Feedback IA'}
                        </button>
                      </div>

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
