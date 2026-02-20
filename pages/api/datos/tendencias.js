// pages/api/datos/tendencias.js
// Devuelve datos gerenciales agrupados por indicador y mes para la tabla de tendencias
// Lee directamente de GERENCIAL_DATOS sin simulaciones

import { getGerencialData } from '../../../lib/googleSheets';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { ano, proceso } = req.query;
    const anoFiltro = parseInt(ano) || new Date().getFullYear();

    const datos = await getGerencialData();

    // Filtrar por año
    const datosFiltrados = datos.filter(d => {
      const dAno = d.ano || d.año;
      return dAno === anoFiltro;
    });

    // Agrupar por proceso e indicador
    const grupos = {};
    datosFiltrados.forEach(d => {
      if (proceso && d.proceso !== proceso) return;

      const key = `${d.proceso}__${d.indicador}`;
      if (!grupos[key]) {
        grupos[key] = {
          proceso: d.proceso,
          indicador: d.indicador,
          meta: d.meta,
          responsable: d.responsable,
          meses: {} // { 'Ene': valor, 'Feb': valor, ... }
        };
      }

      // Normalizar nombre del mes
      const mesNombre = normalizarMes(d.mes);
      if (mesNombre) {
        const valorParsed = parseFloat(d.valor);
        grupos[key].meses[mesNombre] = isNaN(valorParsed) ? d.valor : valorParsed;
      }
    });

    // Convertir a array con valores por mes en orden
    const resultado = Object.values(grupos).map(g => ({
      proceso: g.proceso,
      indicador: g.indicador,
      meta: g.meta,
      responsable: g.responsable,
      // Array de 12 meses en orden, null si no hay dato
      valores: MESES.map(m => g.meses[m] ?? null),
      // Último valor disponible para las tarjetas
      ultimoValor: (() => {
        for (let i = MESES.length - 1; i >= 0; i--) {
          if (g.meses[MESES[i]] !== undefined && g.meses[MESES[i]] !== null) {
            return g.meses[MESES[i]];
          }
        }
        return null;
      })(),
      // Tendencia: comparar últimos dos meses con datos
      tendencia: (() => {
        const vals = MESES.map(m => g.meses[m]).filter(v => v !== undefined && v !== null && !isNaN(v));
        if (vals.length < 2) return 'neutral';
        const diff = vals[vals.length - 1] - vals[vals.length - 2];
        if (Math.abs(diff) < 0.5) return 'neutral';
        return diff > 0 ? 'up' : 'down';
      })(),
    }));

    // Calcular estatus vs meta
    resultado.forEach(r => {
      const meta = parseFloat(r.meta);
      const val = parseFloat(r.ultimoValor);
      if (!isNaN(meta) && !isNaN(val)) {
        const pct = (val / meta) * 100;
        r.estatus = pct >= 100 ? 'CUMPLE' : pct >= 80 ? 'DESARROLLO' : 'ATENCION';
        r.pctMeta = Math.round(pct);
      } else {
        r.estatus = 'SIN_DATO';
        r.pctMeta = null;
      }
    });

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en tendencias:', error);
    res.status(500).json({ error: error.message });
  }
}

function normalizarMes(mes) {
  if (!mes) return null;
  const m = mes.toString().trim().toLowerCase();
  const mapa = {
    'enero': 'Ene', 'ene': 'Ene', '1': 'Ene', '01': 'Ene',
    'febrero': 'Feb', 'feb': 'Feb', '2': 'Feb', '02': 'Feb',
    'marzo': 'Mar', 'mar': 'Mar', '3': 'Mar', '03': 'Mar',
    'abril': 'Abr', 'abr': 'Abr', '4': 'Abr', '04': 'Abr',
    'mayo': 'May', 'may': 'May', '5': 'May', '05': 'May',
    'junio': 'Jun', 'jun': 'Jun', '6': 'Jun', '06': 'Jun',
    'julio': 'Jul', 'jul': 'Jul', '7': 'Jul', '07': 'Jul',
    'agosto': 'Ago', 'ago': 'Ago', '8': 'Ago', '08': 'Ago',
    'septiembre': 'Sep', 'sep': 'Sep', 'sept': 'Sep', '9': 'Sep', '09': 'Sep',
    'octubre': 'Oct', 'oct': 'Oct', '10': 'Oct',
    'noviembre': 'Nov', 'nov': 'Nov', '11': 'Nov',
    'diciembre': 'Dic', 'dic': 'Dic', '12': 'Dic',
  };
  return mapa[m] || null;
}
