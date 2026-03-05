import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const coordinacion = await getSheetData('COORDINACION_DETALLE!A2:J');
    const agendamiento = await getSheetData('AGENDAMIENTO_DETALLE!A2:O');
    const satisfaccion = await getSheetData('SATISFACCION_CLIENTE!A2:W');

    // Coordinación
    let totalFTR = 0, totalTiempo = 0, totalNoConf = 0, countCoord = 0;
    coordinacion.forEach(row => {
      const ftr = parseFloat(row[4]) || 0;
      const tiempo = parseFloat(row[5]) || 0;
      const noConf = parseInt(row[7]) || 0;
      if (ftr > 0) { totalFTR += ftr; countCoord++; }
      totalTiempo += tiempo;
      totalNoConf += noConf;
    });
    const promFTR = countCoord ? (totalFTR / countCoord).toFixed(1) : 0;
    const promTiempo = coordinacion.length ? (totalTiempo / coordinacion.length).toFixed(1) : 0;
    const totalNoConformidades = totalNoConf;

    // Agendamiento
    let totalOportunidades = 0, totalScore = 0, countAgen = 0;
    let conteoABC = { A: 0, B: 0, C: 0 };
    agendamiento.forEach(row => {
      const oportunidades = parseFloat(row[5]) || 0;
      const score = parseFloat(row[13]) || 0;
      const estatus = row[12] || '';
      if (oportunidades > 0) { totalOportunidades += oportunidades; countAgen++; }
      totalScore += score;
      if (estatus === 'A') conteoABC.A++;
      else if (estatus === 'B') conteoABC.B++;
      else if (estatus === 'C') conteoABC.C++;
    });
    const promOportunidades = countAgen ? (totalOportunidades / countAgen).toFixed(1) : 0;
    const promScore = agendamiento.length ? (totalScore / agendamiento.length).toFixed(1) : 0;

    // Satisfacción
    let totalNPS = 0, totalFelicitaciones = 0, quejasAbiertas = 0, totalTiempoCierre = 0, countCerradas = 0;
    satisfaccion.forEach(row => {
      const nps = parseFloat(row[22]) || 0;
      const felicitacion = row[10]?.toLowerCase().includes('felicitacion') ? 1 : 0;
      const status = row[20] || '';
      const tiempoCierre = parseFloat(row[22]) || 0;
      if (nps > 0) totalNPS += nps;
      if (felicitacion) totalFelicitaciones++;
      if (status !== 'CERRADA') quejasAbiertas++;
      if (tiempoCierre > 0) { totalTiempoCierre += tiempoCierre; countCerradas++; }
    });
    const promNPS = satisfaccion.length ? (totalNPS / satisfaccion.length).toFixed(1) : 0;
    const promFelicitaciones = satisfaccion.length ? ((totalFelicitaciones / satisfaccion.length) * 100).toFixed(1) : 0;
    const promTiempoCierre = countCerradas ? (totalTiempoCierre / countCerradas).toFixed(1) : 0;

    res.status(200).json({
      coordinacion: {
        ftr: promFTR,
        tiempo: promTiempo,
        noConformidades: totalNoConformidades
      },
      agendamiento: {
        oportunidades: promOportunidades,
        score: promScore,
        distribucionABC: conteoABC
      },
      satisfaccion: {
        nps: promNPS,
        felicitaciones: promFelicitaciones,
        quejasAbiertas,
        tiempoCierre: promTiempoCierre
      }
    });
  } catch (error) {
    console.error('Error en kpis:', error);
    res.status(500).json({ error: 'Error al calcular KPIs' });
  }
}
