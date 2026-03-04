import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import PeriodSelector from '../components/layout/PeriodSelector';
import FloatingUploadButton from '../components/upload/FloatingUploadButton';
import SkeletonTable from '../components/ui/SkeletonTable';
import EmptyState from '../components/ui/EmptyState';
import InfoTooltip from '../components/ui/InfoTooltip';
import FichaTecnica from '../components/ui/FichaTecnica';
import SatisfaccionFicha from '../components/ui/SatisfaccionFicha';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('gerencial');

  // Estados principales
  const [gerencialData, setGerencialData] = useState([]);
  const [coordinacionData, setCoordinacionData] = useState([]);
  const [agendamientoData, setAgendamientoData] = useState([]);
  const [satisfaccionData, setSatisfaccionData] = useState([]);
  const [tendenciasData, setTendenciasData] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [seguimientos, setSeguimientos] = useState({});
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [filtroArea, setFiltroArea] = useState('TODAS');
  const [filtroTierCoordinacion, setFiltroTierCoordinacion] = useState(null);
  const [filtrosSatisfaccion, setFiltrosSatisfaccion] = useState({
    sucursal: 'TODAS',
    proceso: 'TODOS',
    status: 'TODOS',
    mes: 'TODOS',
    semana: 'TODAS'
  });

  // UI
  const [panelAbierto, setPanelAbierto] = useState(null);
  const [notasForm, setNotasForm] = useState({});
  const [guardando, setGuardando] = useState(null);
  const [enviando, setEnviando] = useState(null);
  const [fichaColaborador, setFichaColaborador] = useState(null);
  const [recomendacionesCompletadas, setRecomendacionesCompletadas] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const guardadas = localStorage.getItem('recomendaciones-completadas');
        return guardadas ? JSON.parse(guardadas) : [];
      } catch { return []; }
    }
    return [];
  });

  const [periodo, setPeriodo] = useState({
    tipo: 'year',
    valor: 'Año Completo',
    año: 2025
  });

  // ========== UTILIDADES ==========
  const getRangoDeFechas = (periodo) => {
    const ano = periodo.ano || periodo.año || new Date().getFullYear();
    if (periodo.tipo === 'year') return { fechaInicio: `${ano}-01-01`, fechaFin: `${ano}-12-31` };
    if (periodo.tipo === '52weeks') {
      const hoy = new Date();
      const hace52 = new Date(hoy);
      hace52.setDate(hoy.getDate() - 364);
      const fmt = (d) => d.toISOString().split('T')[0];
      return { fechaInicio: fmt(hace52), fechaFin: fmt(hoy) };
    }
    if (periodo.tipo === 'month') {
      const meses = { 'Enero':1,'Febrero':2,'Marzo':3,'Abril':4,'Mayo':5,'Junio':6,
                      'Julio':7,'Agosto':8,'Septiembre':9,'Octubre':10,'Noviembre':11,'Diciembre':12 };
      const mes = meses[periodo.valor] || 1;
      const ultimo = new Date(ano, mes, 0).getDate();
      const mm = String(mes).padStart(2,'0');
      return { fechaInicio: `${ano}-${mm}-01`, fechaFin: `${ano}-${mm}-${ultimo}` };
    }
    if (periodo.tipo === 'quarter') {
      const trimestres = {
        'Q1 (Ene-Mar)':[1,3], 'Q2 (Abr-Jun)':[4,6],
        'Q3 (Jul-Sep)':[7,9], 'Q4 (Oct-Dic)':[10,12]
      };
      const [mesInicio, mesFin] = trimestres[periodo.valor] || [1,3];
      const ultimo = new Date(ano, mesFin, 0).getDate();
      const mmI = String(mesInicio).padStart(2,'0');
      const mmF = String(mesFin).padStart(2,'0');
      return { fechaInicio: `${ano}-${mmI}-01`, fechaFin: `${ano}-${mmF}-${ultimo}` };
    }
    if (periodo.tipo === 'semester') {
      const semestres = { 'S1 (Ene-Jun)': [1, 6], 'S2 (Jul-Dic)': [7, 12] };
      const [mesInicio, mesFin] = semestres[periodo.valor] || [1, 6];
      const ultimo = new Date(ano, mesFin, 0).getDate();
      const mmI = String(mesInicio).padStart(2,'0');
      const mmF = String(mesFin).padStart(2,'0');
      return { fechaInicio: `${ano}-${mmI}-01`, fechaFin: `${ano}-${mmF}-${ultimo}` };
    }
    if (periodo.tipo === 'bimonth') {
      const bimestres = {
        'B1 (Ene-Feb)': [1, 2], 'B2 (Mar-Abr)': [3, 4],
        'B3 (May-Jun)': [5, 6], 'B4 (Jul-Ago)': [7, 8],
        'B5 (Sep-Oct)': [9, 10], 'B6 (Nov-Dic)': [11, 12]
      };
      const [mesInicio, mesFin] = bimestres[periodo.valor] || [1, 2];
      const ultimo = new Date(ano, mesFin, 0).getDate();
      const mmI = String(mesInicio).padStart(2,'0');
      const mmF = String(mesFin).padStart(2,'0');
      return { fechaInicio: `${ano}-${mmI}-01`, fechaFin: `${ano}-${mmF}-${ultimo}` };
    }
    if (periodo.tipo === 'week') {
      const semana = parseInt(periodo.valor) || 1;
      const primerDia = new Date(ano, 0, 1 + (semana - 1) * 7);
      const ultimoDia = new Date(primerDia);
      ultimoDia.setDate(primerDia.getDate() + 6);
      const fmt = (d) => d.toISOString().split('T')[0];
      return { fechaInicio: fmt(primerDia), fechaFin: fmt(ultimoDia) };
    }
    return { fechaInicio: `${ano}-01-01`, fechaFin: `${ano}-12-31` };
  };

  // ========== CARGA DE DATOS ==========
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const { fechaInicio, fechaFin } = getRangoDeFechas(periodo);
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      const qs = params.toString() ? `?${params.toString()}` : '';

      const ano = periodo.ano || periodo.año || new Date().getFullYear();
      const gerencialParams = new URLSearchParams({ ano });
      if (periodo.tipo === 'month') gerencialParams.append('mes', periodo.valor);
      if (periodo.tipo === 'quarter') gerencialParams.append('trimestre', periodo.valor);
      if (periodo.tipo === 'week') gerencialParams.append('semana', periodo.valor);
      const gerencialQs = `?${gerencialParams.toString()}`;

      const [
        gerencial,
        coordinacion,
        agendamiento,
        recs,
        tendencias,
        satisfaccion,
        cols
      ] = await Promise.all([
        fetch(`/api/datos/gerencial${gerencialQs}`).then(res => res.json()),
        fetch(`/api/datos/coordinacion${qs}`).then(res => res.json()),
        fetch(`/api/datos/agendamiento${qs}`).then(res => res.json()),
        fetch('/api/recomendaciones').then(res => res.json()),
        fetch(`/api/datos/tendencias?ano=${ano}`).then(res => res.json()),
        fetch(`/api/datos/satisfaccion${qs}`).then(res => res.json()),
        fetch('/api/datos/colaboradores').then(res => res.json())
      ]);

      setGerencialData(Array.isArray(gerencial) ? gerencial : []);
      setCoordinacionData(Array.isArray(coordinacion) ? coordinacion : []);
      setAgendamientoData(Array.isArray(agendamiento) ? agendamiento : []);
      setRecomendaciones(Array.isArray(recs) ? recs : []);
      setTendenciasData(Array.isArray(tendencias) ? tendencias : []);
      setSatisfaccionData(Array.isArray(satisfaccion) ? satisfaccion : []);
      setColaboradores(Array.isArray(cols) ? cols : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    cargarDatos();
    const handleRefresh = () => cargarDatos();
    window.addEventListener('refresh-data', handleRefresh);
    return () => window.removeEventListener('refresh-data', handleRefresh);
  }, [cargarDatos]);

  useEffect(() => {
    fetch('/api/seguimiento')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(s => {
            if (!map[s.recomendacionId]) map[s.recomendacionId] = [];
            map[s.recomendacionId].push(s);
          });
          setSeguimientos(map);
        }
      })
      .catch(() => {});
  }, []);

  // ========== HELPERS ==========
  const getColaborador = (nombre) =>
    colaboradores.find(c => c.nombre?.toLowerCase().includes((nombre || '').toLowerCase())) || null;

  const guardarNotas = async (rec) => {
    const form = notasForm[rec.id] || {};
    if (!form.notas && !form.acuerdos) return;
    setGuardando(rec.id);
    try {
      const colab = getColaborador(rec.agente);
      const body = {
        recomendacionId: rec.id,
        colaborador: rec.agente,
        area: rec.area,
        nivel: rec.nivel,
        metrica: rec.metrica,
        notas: form.notas || '',
        acuerdos: form.acuerdos || '',
        fechaCompromiso: form.fechaCompromiso || '',
        responsable: 'Alcantar Janeth',
        feedbackIA: rec.feedback || '',
      };
      const resp = await fetch('/api/seguimiento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await resp.json();
      if (data.id) {
        setSeguimientos(prev => ({
          ...prev,
          [rec.id]: [...(prev[rec.id] || []), { ...body, id: data.id, estado: 'PENDIENTE', fechaRegistro: new Date().toISOString().split('T')[0] }]
        }));
        alert('Notas guardadas correctamente');
      }
    } catch (e) {
      alert('Error guardando notas: ' + e.message);
    } finally {
      setGuardando(null);
    }
  };

  const generarPDF = async (rec) => {
    const form = notasForm[rec.id] || {};
    const colab = getColaborador(rec.agente);
    setEnviando(rec.id);
    try {
      const { generarConstanciaPDF } = await import('../lib/generarConstanciaPDF');
      await generarConstanciaPDF({
        colaborador: rec.agente,
        area: rec.area,
        nivel: rec.nivel,
        metrica: rec.metrica,
        notas: form.notas || '',
        acuerdos: form.acuerdos || '',
        fechaCompromiso: form.fechaCompromiso || '',
        responsable: 'Alcantar Janeth',
        feedbackIA: rec.feedback || '',
        unidad: colab?.unidad || '',
        puesto: colab?.puesto || '',
      });
    } catch (e) {
      alert('Error generando PDF: ' + e.message);
    } finally {
      setEnviando(null);
    }
  };

  const generarFeedbackIA = async (recomendacion) => {
    setRecomendaciones(prev => prev.map(r => r.id === recomendacion.id ? { ...r, generandoFeedback: true } : r));
    try {
      const valorNumerico = parseFloat(recomendacion.metrica) || 0;
      const response = await fetch('/api/feedback-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agente: recomendacion.agente,
          metrica: recomendacion.metrica,
          valor: valorNumerico,
          nivel: recomendacion.nivel,
          area: recomendacion.area
        })
      });
      if (!response.ok) throw new Error('Error en la API');
      const data = await response.json();
      setRecomendaciones(prev => prev.map(r => r.id === recomendacion.id ? { ...r, feedback: data.feedback, generandoFeedback: false } : r));
    } catch (error) {
      console.error(error);
      setRecomendaciones(prev => prev.map(r => r.id === recomendacion.id ? { ...r, generandoFeedback: false } : r));
      alert('Error al generar feedback');
    }
  };

  const marcarCompletada = (id) => {
    setRecomendacionesCompletadas(prev => {
      const nuevas = prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id];
      try { localStorage.setItem('recomendaciones-completadas', JSON.stringify(nuevas)); } catch {}
      return nuevas;
    });
  };

  // ========== FILTROS ==========
  const recomendacionesFiltradas = recomendaciones.filter(r => {
    if (filtroNivel !== 'TODOS' && r.nivel !== filtroNivel) return false;
    if (filtroArea !== 'TODAS' && r.area !== filtroArea) return false;
    return true;
  });

  const coordinacionFiltrada = filtroTierCoordinacion
    ? coordinacionData.filter(c => c.semaforo === filtroTierCoordinacion)
    : coordinacionData;

  const satisfaccionFiltrada = satisfaccionData.filter(q => {
    if (filtrosSatisfaccion.sucursal !== 'TODAS' && q.sucursal !== filtrosSatisfaccion.sucursal) return false;
    if (filtrosSatisfaccion.proceso !== 'TODOS' && q.proceso !== filtrosSatisfaccion.proceso) return false;
    if (filtrosSatisfaccion.status !== 'TODOS' && q.status !== filtrosSatisfaccion.status) return false;
    if (filtrosSatisfaccion.mes !== 'TODOS' && q.mes !== filtrosSatisfaccion.mes) return false;
    if (filtrosSatisfaccion.semana !== 'TODAS' && q.semana !== parseInt(filtrosSatisfaccion.semana)) return false;
    return true;
  });

  // ========== AGRUPACIONES ==========
  const coordinacionResumen = gerencialData.filter(d => d.proceso === 'Coordinación');
  const agendamientoResumen = gerencialData.filter(d => d.proceso === 'Agendamiento');
  const satisfaccionResumen = gerencialData.filter(d => d.proceso === 'Satisfacción');
  const tendenciasCoord = tendenciasData.filter(d => d.proceso === 'Coordinación');
  const tendenciasAgen = tendenciasData.filter(d => d.proceso === 'Agendamiento');
  const MESES_TABLA = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // Opciones para filtros de satisfacción
  const opcionesSucursales = ['TODAS', ...new Set(satisfaccionData.map(q => q.sucursal).filter(Boolean))];
  const opcionesProcesos = ['TODOS', ...new Set(satisfaccionData.map(q => q.proceso).filter(Boolean))];
  const opcionesStatus = ['TODOS', ...new Set(satisfaccionData.map(q => q.status).filter(Boolean))];
  const opcionesMeses = ['TODOS', ...new Set(satisfaccionData.map(q => q.mes).filter(Boolean))];
  const opcionesSemanas = ['TODAS', ...new Set(satisfaccionData.map(q => q.semana).filter(Boolean))];

  // ========== SEMÁFORO Y TENDENCIAS ==========
  const getSemaforoColor = (semaforo) => {
    switch(semaforo) {
      case 'VERDE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'AMARILLO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ROJO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTendenciaIcon = (indicador) => {
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

  const seguimientosTodos = Object.values(seguimientos).flat();

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
      {fichaColaborador && (
        <FichaTecnica
          colaborador={fichaColaborador.datos}
          tipo={fichaColaborador.tipo}
          seguimientos={seguimientosTodos}
          recomendaciones={recomendaciones}
          onClose={() => setFichaColaborador(null)}
        />
      )}

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
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">AJ</div>
            </div>
          </div>

          {activeTab !== 'planaccion' && (
            <div className="mt-4">
              <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} />
            </div>
          )}

          <nav className="flex space-x-6 mt-4 overflow-x-auto pb-2" aria-label="Tabs">
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

      <main className="p-4 md:p-6">
        {/* ========== VISTA GERENCIAL ========== */}
        {activeTab === 'gerencial' && (
          <>
            {/* Coordinación */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#0066CC] rounded-full"></span>
                COORDINACIÓN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {coordinacionResumen.length === 0 ? (
                  <div className="col-span-4"><EmptyState periodo={periodo.valor} tipo={periodo.tipo} /></div>
                ) : (
                  coordinacionResumen.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer" onClick={() => { setActiveTab('coordinacion'); setFiltroTierCoordinacion(null); }}>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-800">{item.valor}%</span>
                          <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                        </div>
                        <span className={`text-lg ${getTendenciaColor(getTendenciaIcon(item.indicador))}`}>{getTendenciaIcon(item.indicador)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Agendamiento */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#0066CC] rounded-full"></span>
                AGENDAMIENTO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {agendamientoResumen.length === 0 ? (
                  <div className="col-span-4"><EmptyState periodo={periodo.valor} tipo={periodo.tipo} /></div>
                ) : (
                  agendamientoResumen.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('agendamiento')}>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-800">{typeof item.valor === 'number' ? item.valor + '%' : item.valor}</span>
                          <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                        </div>
                        <span className={`text-lg ${getTendenciaColor(getTendenciaIcon(item.indicador))}`}>{getTendenciaIcon(item.indicador)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Satisfacción */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#0066CC] rounded-full"></span>
                SATISFACCIÓN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {satisfaccionResumen.length === 0 ? (
                  <div className="col-span-4"><EmptyState periodo={periodo.valor} tipo={periodo.tipo} /></div>
                ) : (
                  satisfaccionResumen.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('satisfaccion')}>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">{item.indicador}</div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-800">{item.valor}</span>
                          <span className="text-xs text-slate-400 ml-1">/ {item.meta}</span>
                        </div>
                        <span className={`text-lg ${getTendenciaColor(getTendenciaIcon(item.indicador))}`}>{getTendenciaIcon(item.indicador)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ========== VISTA COORDINACIÓN ========== */}
        {activeTab === 'coordinacion' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">COORDINACIÓN - Detalle por Colaborador</h3>
              <p className="text-xs text-slate-400 mt-1">Ritual diario obligatorio (10 minutos) - Revisar quién estuvo debajo de meta y acción correctiva inmediata</p>
            </div>
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <p className="text-xs text-blue-700"><span className="font-bold">Regla de reincidencia:</span> 1 vez → retroalimentación | 2 veces → plan de mejora | 3 veces → incidencia formal</p>
            </div>
            <div className="p-4 flex gap-2 border-b border-slate-100 overflow-x-auto">
              <button onClick={() => setFiltroTierCoordinacion(null)} className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${filtroTierCoordinacion === null ? 'bg-[#0066CC] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos ({coordinacionData.length})</button>
              <button onClick={() => setFiltroTierCoordinacion('VERDE')} className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${filtroTierCoordinacion === 'VERDE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>🟢 Excelente ({coordinacionData.filter(c => c.semaforo === 'VERDE').length})</button>
              <button onClick={() => setFiltroTierCoordinacion('AMARILLO')} className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${filtroTierCoordinacion === 'AMARILLO' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>🟡 En desarrollo ({coordinacionData.filter(c => c.semaforo === 'AMARILLO').length})</button>
              <button onClick={() => setFiltroTierCoordinacion('ROJO')} className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${filtroTierCoordinacion === 'ROJO' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>🔴 Atención ({coordinacionData.filter(c => c.semaforo === 'ROJO').length})</button>
            </div>
            <div className="overflow-x-auto">
              {coordinacionFiltrada.length === 0 ? <div className="p-8"><EmptyState periodo="este filtro" tipo="filtro" /></div> : (
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
                      <th className="p-4 text-xs font-black text-slate-400 uppercase text-center">
                        <div className="flex items-center justify-center gap-1">
                          Semáforo
                          <InfoTooltip content={<div className="w-56 text-left space-y-1"><p><span className="text-emerald-400 font-bold">🟢 Excelente:</span> FTR ≥98%, Tiempo ≤7min y NoConf=0</p><p><span className="text-amber-400 font-bold">🟡 En desarrollo:</span> FTR ≥95% o Tiempo ≤8min o NoConf≤2</p><p><span className="text-red-400 font-bold">🔴 Atención:</span> No cumple criterios mínimos</p></div>} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinacionFiltrada.map((col, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">
                          <button onClick={() => setFichaColaborador({ datos: col, tipo: 'coordinacion' })} className="text-left font-medium text-[#0066CC] hover:underline">{col.colaborador}</button>
                        </td>
                        <td className="p-4 text-slate-600">{col.unidad}</td>
                        <td className="p-4 text-center"><span className={`font-mono font-bold ${col.ftr >= 98 ? 'text-emerald-600' : col.ftr >= 95 ? 'text-amber-600' : 'text-red-600'}`}>{col.ftr.toFixed(1)}%</span></td>
                        <td className="p-4 text-center font-mono">{col.tiempoPromedio.toFixed(1)}</td>
                        <td className="p-4 text-center font-mono">{col.cantidadRegistros}</td>
                        <td className="p-4 text-center font-mono">{col.noConformidades}</td>
                        <td className="p-4 text-center font-mono">{col.snc}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getSemaforoColor(col.semaforo)}`}>
                            <span className={`w-2 h-2 rounded-full ${col.semaforo === 'VERDE' ? 'bg-emerald-500' : col.semaforo === 'AMARILLO' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                            {col.semaforo === 'VERDE' ? 'Excelente' : col.semaforo === 'AMARILLO' ? 'En desarrollo' : 'Atención'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========== VISTA AGENDAMIENTO ========== */}
        {activeTab === 'agendamiento' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">AGENDAMIENTO - Detalle por Asesor</h3>
              <p className="text-xs text-slate-400 mt-1">Validación obligatoria diaria: 10 auditorías de agendamiento por vendedor</p>
            </div>
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <p className="text-xs text-blue-700"><span className="font-bold">Regla de reincidencia:</span> 1 vez → retroalimentación-minuta | 2 veces → Incidencia | 3 veces → Acta Administrativa</p>
            </div>
            <div className="overflow-x-auto">
              {agendamientoData.length === 0 ? <div className="p-8"><EmptyState periodo="actual" tipo="datos" /></div> : (
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
                        <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                          <button onClick={() => setFichaColaborador({ datos: asesor, tipo: 'agendamiento' })} className="text-left font-medium text-[#0066CC] hover:underline">{asesor.asesor}</button>
                        </td>
                        <td className="p-4 text-center font-mono">{asesor.citasAgendadas}</td>
                        <td className="p-4 text-center font-mono">{asesor.oportunidadesAprovechadas}%</td>
                        <td className="p-4 text-center font-mono">{asesor.hallazgosCotizacion}%</td>
                        <td className="p-4 text-center font-mono">{asesor.hallazgosVenta}%</td>
                        <td className="p-4 text-center font-mono">{asesor.efectividadHallazgos}%</td>
                        <td className="p-4 text-center font-mono">{asesor.snc}</td>
                        <td className="p-4 text-center font-mono">{asesor.noConformidades}</td>
                        <td className="p-4 text-center font-mono">{asesor.efectividadAgendamiento}%</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${asesor.estatus === 'A' ? 'bg-emerald-100 text-emerald-600' : asesor.estatus === 'B' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{asesor.estatus}</span>
                        </td>
                        <td className="p-4 text-center font-mono">{asesor.scoreTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========== VISTA SATISFACCIÓN ========== */}
        {activeTab === 'satisfaccion' && (
          <div className="space-y-6">
            {/* Tarjetas KPI (desde gerencial) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['NPS Promedio', '% Felicitaciones Clientes', 'Quejas Abiertas', 'Tiempo Prom. Cierre (días)'].map((kpi, idx) => {
                const item = satisfaccionResumen.find(d => d.indicador === kpi) || { valor: 'N/A', meta: '-' };
                return (
                  <div key={idx} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">{kpi}</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{item.valor}</p>
                    <p className="text-xs text-slate-400 mt-2">Meta: {item.meta}</p>
                  </div>
                );
              })}
            </div>

            {/* Filtros con etiquetas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">🔍 Filtrar quejas <InfoTooltip content="Filtra por sucursal, proceso, estado, mes o semana" /></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sucursal</label>
                  <select value={filtrosSatisfaccion.sucursal} onChange={e => setFiltrosSatisfaccion({...filtrosSatisfaccion, sucursal: e.target.value})} className="text-xs border rounded-lg px-3 py-2 w-full">{opcionesSucursales.map(op => <option key={op}>{op}</option>)}</select>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Proceso</label>
                  <select value={filtrosSatisfaccion.proceso} onChange={e => setFiltrosSatisfaccion({...filtrosSatisfaccion, proceso: e.target.value})} className="text-xs border rounded-lg px-3 py-2 w-full">{opcionesProcesos.map(op => <option key={op}>{op}</option>)}</select>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Estado</label>
                  <select value={filtrosSatisfaccion.status} onChange={e => setFiltrosSatisfaccion({...filtrosSatisfaccion, status: e.target.value})} className="text-xs border rounded-lg px-3 py-2 w-full">{opcionesStatus.map(op => <option key={op}>{op}</option>)}</select>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mes</label>
                  <select value={filtrosSatisfaccion.mes} onChange={e => setFiltrosSatisfaccion({...filtrosSatisfaccion, mes: e.target.value})} className="text-xs border rounded-lg px-3 py-2 w-full">{opcionesMeses.map(op => <option key={op}>{op}</option>)}</select>
                </div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Semana</label>
                  <select value={filtrosSatisfaccion.semana} onChange={e => setFiltrosSatisfaccion({...filtrosSatisfaccion, semana: e.target.value})} className="text-xs border rounded-lg px-3 py-2 w-full">{opcionesSemanas.map(op => <option key={op}>{op}</option>)}</select>
                </div>
              </div>
            </div>

            {/* Listado de quejas (mostrando el número de queja como identificador) */}
            <div className="space-y-3">
              {satisfaccionFiltrada.length === 0 ? <EmptyState periodo={periodo.valor} tipo={periodo.tipo} /> : (
                satisfaccionFiltrada.map((queja, idx) => (
                  <SatisfaccionFicha
                    key={idx}
                    queja={queja}
                    onVerDetalle={(q) => setFichaColaborador({ datos: { queja: q }, tipo: 'queja' })}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== VISTA PLAN DE ACCIÓN ========== */}
        {activeTab === 'planaccion' && (
          <div className="space-y-6">
            {/* Filtros de área y nivel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  {['TODAS', 'Coordinación', 'Agendamiento', 'Satisfacción'].map(area => (
                    <button key={area} onClick={() => setFiltroArea(area)} className={`px-3 py-1 text-xs rounded-full transition-all ${filtroArea === area ? 'bg-[#0066CC] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{area}</button>
                  ))}
                </div>
                <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)} className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option value="TODOS">Todos los niveles</option>
                  <option value="URGENTE">🔴 Urgente</option>
                  <option value="CRÍTICO">🟠 Crítico</option>
                  <option value="ALTO">🟡 Alto</option>
                  <option value="VERDE">🟢 Verde</option>
                </select>
              </div>
            </div>

            {/* Planes por nivel (igual que antes) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">📊 PLANES DE ACCIÓN POR NIVEL</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { nivel: 'URGENTE', color: 'red', accion: 'Intervención diaria', meta: 'Subir a amarillo en 2 semanas', count: recomendaciones.filter(r => r.nivel === 'URGENTE').length },
                  { nivel: 'CRÍTICO', color: 'orange', accion: 'Coaching intensivo', meta: 'Subir a amarillo en 3 semanas', count: recomendaciones.filter(r => r.nivel === 'CRÍTICO').length },
                  { nivel: 'ALTO', color: 'amber', accion: 'Coaching semanal', meta: 'Subir a verde en 1 mes', count: recomendaciones.filter(r => r.nivel === 'ALTO').length },
                  { nivel: 'VERDE', color: 'emerald', accion: 'Mentoría a otros', meta: 'Mantener y compartir', count: recomendaciones.filter(r => r.nivel === 'VERDE').length },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${item.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' : item.nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' : item.nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} cursor-pointer hover:shadow-md`} onClick={() => setFiltroNivel(item.nivel)}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-black uppercase ${item.nivel === 'URGENTE' ? 'text-red-600' : item.nivel === 'CRÍTICO' ? 'text-orange-600' : item.nivel === 'ALTO' ? 'text-amber-600' : 'text-emerald-600'}`}>{item.nivel}</span>
                      <span className={`text-sm font-bold ${item.nivel === 'URGENTE' ? 'text-red-600' : item.nivel === 'CRÍTICO' ? 'text-orange-600' : item.nivel === 'ALTO' ? 'text-amber-600' : 'text-emerald-600'}`}>{item.count}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700">{item.accion}</p>
                    <p className="text-[10px] text-slate-500 mt-2">{item.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Listado de recomendaciones (la misma estructura de la versión 2 pero filtrada por área) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">📋 RECOMENDACIONES PRIORIZADAS</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">Basado en reglas de negocio y reincidencias</p>
              </div>
              <div className="p-4 max-h-[800px] overflow-y-auto">
                {recomendacionesFiltradas.length === 0 ? <div className="p-8"><EmptyState periodo="este nivel" tipo="filtro" /></div> : (
                  recomendacionesFiltradas.map(rec => {
                    const completada = recomendacionesCompletadas.includes(rec.id);
                    const abierto = panelAbierto === rec.id;
                    const form = notasForm[rec.id] || {};
                    const segs = seguimientos[rec.id] || [];
                    return (
                      <div key={rec.id} id={`recomendacion-${rec.id}`} className={`mb-4 rounded-xl border transition-all ${completada ? 'bg-slate-50 border-slate-200 opacity-70' : rec.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' : rec.nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' : rec.nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        {/* Cabecera (igual que en versión 2) */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rec.nivel === 'URGENTE' ? 'bg-red-600' : rec.nivel === 'CRÍTICO' ? 'bg-orange-500' : rec.nivel === 'ALTO' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                              <span className="text-xs font-black uppercase">{rec.nivel}</span>
                              {segs.length > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{segs.filter(s => s.estado === 'PENDIENTE').length} acuerdo(s) activo(s)</span>}
                            </div>
                            <span className="text-[10px] bg-white px-2 py-1 rounded-full border">{rec.area}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 mb-1">{rec.agente}</h4>
                          <p className="text-xs text-slate-600 mb-3">{rec.metrica}</p>
                          <div className="bg-white/50 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium mb-1">▶ {rec.sugerencia}</p>
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>👤 {rec.responsable}</span>
                              <span>⏱️ {rec.plazo} · 📅 {rec.fechaLimite}</span>
                            </div>
                          </div>
                          {rec.feedback && (
                            <div className="mb-3 p-3 bg-white rounded-lg border border-blue-100">
                              <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">🤖 Feedback IA</p>
                              <p className="text-xs text-slate-700 italic">"{rec.feedback}"</p>
                            </div>
                          )}
                          {segs.length > 0 && (
                            <div className="mb-3 space-y-2">
                              {segs.map((seg, i) => (
                                <div key={i} className="bg-white rounded-lg border border-slate-200 p-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">📋 Sesión {new Date(seg.fechaRegistro).toLocaleDateString()}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${seg.estado === 'COMPLETADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{seg.estado}</span>
                                  </div>
                                  {seg.notas && <p className="text-xs text-slate-600"><span className="font-semibold">Notas:</span> {seg.notas}</p>}
                                  {seg.acuerdos && <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Acuerdos:</span> {seg.acuerdos}</p>}
                                  {seg.fechaCompromiso && <p className="text-[10px] text-slate-400 mt-1">📅 Compromiso: {new Date(seg.fechaCompromiso).toLocaleDateString()}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Botones */}
                          <div className="flex flex-wrap justify-end gap-2">
                            <button onClick={() => generarFeedbackIA(rec)} disabled={rec.generandoFeedback} className="text-xs bg-[#0066CC] hover:bg-[#0052a3] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${rec.generandoFeedback ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                              {rec.generandoFeedback ? 'Generando...' : 'Feedback IA'}
                            </button>
                            <button onClick={() => setPanelAbierto(abierto ? null : rec.id)} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 border ${abierto ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              {abierto ? 'Cerrar notas' : 'Agregar notas'}
                            </button>
                            <button onClick={() => marcarCompletada(rec.id)} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 ${completada ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              {completada ? 'Completado' : 'Marcar hecho'}
                            </button>
                          </div>
                        </div>
                        {/* Panel de notas */}
                        {abierto && (
                          <div className="border-t border-white/50 bg-white/70 p-4 rounded-b-xl">
                            <h5 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">📝 Sesión de retroalimentación</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notas</label>
                                <textarea rows={3} value={form.notas || ''} onChange={e => setNotasForm(prev => ({ ...prev, [rec.id]: { ...prev[rec.id], notas: e.target.value } }))} className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Acuerdos</label>
                                <textarea rows={3} value={form.acuerdos || ''} onChange={e => setNotasForm(prev => ({ ...prev, [rec.id]: { ...prev[rec.id], acuerdos: e.target.value } }))} className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white" />
                              </div>
                            </div>
                            <div className="flex items-end gap-3 mb-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fecha compromiso</label>
                                <input type="date" value={form.fechaCompromiso || ''} onChange={e => setNotasForm(prev => ({ ...prev, [rec.id]: { ...prev[rec.id], fechaCompromiso: e.target.value } }))} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white" />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => guardarNotas(rec)} disabled={guardando === rec.id} className="text-xs bg-slate-700 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg">{guardando === rec.id ? '⏳ Guardando...' : '💾 Guardar en Sheets'}</button>
                              <button onClick={() => generarPDF(rec)} disabled={enviando === rec.id} className="text-xs bg-[#0066CC] hover:bg-[#0052a3] text-white px-4 py-1.5 rounded-lg">{enviando === rec.id ? '⏳ Generando...' : '📄 Descargar constancia PDF'}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <FloatingUploadButton />
      <footer className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[3px] pb-4">
        Análisis Integral de Desempeño · Recomendaciones basadas en IA
      </footer>
    </div>
  );
}
