import { useState, useEffect } from 'react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const TRIMESTRES = ['Q1 (Ene-Mar)','Q2 (Abr-Jun)','Q3 (Jul-Sep)','Q4 (Oct-Dic)'];
const SEMESTRES  = ['S1 (Ene-Jun)','S2 (Jul-Dic)'];
const BIMESTRES  = ['B1 (Ene-Feb)','B2 (Mar-Abr)','B3 (May-Jun)',
                    'B4 (Jul-Ago)','B5 (Sep-Oct)','B6 (Nov-Dic)'];

const AÑO_ACTUAL = new Date().getFullYear();
const AÑOS = [AÑO_ACTUAL, AÑO_ACTUAL - 1, AÑO_ACTUAL - 2];

function getRangoTexto(periodo) {
  const a = periodo.año || AÑO_ACTUAL;
  if (periodo.tipo === 'year')      return `Ene ${a} - Dic ${a}`;
  if (periodo.tipo === '52weeks')   return `Últ. 52 semanas`;
  if (periodo.tipo === 'month')     return `${periodo.valor} ${a}`;
  if (periodo.tipo === 'quarter') {
    const map = {'Q1 (Ene-Mar)':'Ene-Mar','Q2 (Abr-Jun)':'Abr-Jun',
                 'Q3 (Jul-Sep)':'Jul-Sep','Q4 (Oct-Dic)':'Oct-Dic'};
    return `${map[periodo.valor] || periodo.valor} ${a}`;
  }
  if (periodo.tipo === 'semester') {
    return periodo.valor === 'S1 (Ene-Jun)' ? `Ene-Jun ${a}` : `Jul-Dic ${a}`;
  }
  if (periodo.tipo === 'bimonth') {
    const map = {'B1 (Ene-Feb)':'Ene-Feb','B2 (Mar-Abr)':'Mar-Abr','B3 (May-Jun)':'May-Jun',
                 'B4 (Jul-Ago)':'Jul-Ago','B5 (Sep-Oct)':'Sep-Oct','B6 (Nov-Dic)':'Nov-Dic'};
    return `${map[periodo.valor] || periodo.valor} ${a}`;
  }
  if (periodo.tipo === 'week')      return `Semana ${periodo.valor} - ${a}`;
  return '';
}

function getSubopciones(tipo) {
  if (tipo === 'month')    return MESES;
  if (tipo === 'quarter')  return TRIMESTRES;
  if (tipo === 'semester') return SEMESTRES;
  if (tipo === 'bimonth')  return BIMESTRES;
  if (tipo === 'week')     return Array.from({length:52}, (_,i) => `${i+1}`);
  return [];
}

export default function PeriodSelector({ periodo, setPeriodo }) {
  const [includeDeparted, setIncludeDeparted] = useState(false);

  const tipos = [
    { id: '52weeks',  label: 'Últimas 52 Semanas' },
    { id: 'year',     label: 'Año Completo' },
    { id: 'semester', label: 'Semestre' },
    { id: 'quarter',  label: 'Trimestre' },
    { id: 'bimonth',  label: 'Bimestre' },
    { id: 'month',    label: 'Mes' },
    { id: 'week',     label: 'Semana' },
  ];

  const subopciones = getSubopciones(periodo.tipo);
  const necesitaSubopcion = subopciones.length > 0;

  const handleTipo = (tipo) => {
    const sub = getSubopciones(tipo);
    setPeriodo({
      tipo,
      valor: sub.length > 0 ? sub[0] : 'Año Completo',
      año: periodo.año || AÑO_ACTUAL
    });
  };

  const handleValor = (valor) => {
    setPeriodo({ ...periodo, valor });
  };

  const handleAño = (año) => {
    setPeriodo({ ...periodo, año: parseInt(año) });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Período:</span>

        {/* Tipo de período */}
        <select
          value={periodo.tipo}
          onChange={(e) => handleTipo(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        >
          {tipos.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        {/* Subopción (mes, semana, trimestre, etc.) */}
        {necesitaSubopcion && (
          <select
            value={periodo.valor}
            onChange={(e) => handleValor(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
          >
            {subopciones.map(s => (
              <option key={s} value={s}>{periodo.tipo === 'week' ? `Semana ${s}` : s}</option>
            ))}
          </select>
        )}

        {/* Año */}
        <select
          value={periodo.año || AÑO_ACTUAL}
          onChange={(e) => handleAño(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        >
          {AÑOS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Checkbox */}
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeDeparted}
            onChange={(e) => setIncludeDeparted(e.target.checked)}
            className="rounded border-slate-300 text-slate-800 focus:ring-slate-200"
          />
          Incluir agentes que se fueron
        </label>

        {/* Rango visual — ahora se actualiza dinámicamente */}
        <div className="ml-auto text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
          {getRangoTexto(periodo)}
        </div>
      </div>
    </div>
  );
}
