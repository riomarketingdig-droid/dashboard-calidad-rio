import { getCoordinacionData, getAgendamientoData, getSatisfaccionData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [coordinacion, agendamiento, satisfaccion] = await Promise.all([
      getCoordinacionData(),
      getAgendamientoData(),
      getSatisfaccionData()
    ]);

    // Coordinación
    let totalFTR = 0, totalTiempo = 0, totalNoConf = 0, countCoord = 0;
    coordinacion.forEach(item => {
      if (item.ftr > 0) { totalFTR += item.ftr; countCoord++; }
      totalTiempo += item.tiempoPromedio;
      totalNoConf += item.noConformidades;
    });
    const promFTR = countCoord ? (totalFTR / countCoord).toFixed(1) : 0;
    const promTiempo = coordinacion.length ? (totalTiempo / coordinacion.length).toFixed(1) : 0;
    const totalNoConformidades = totalNoConf;

    // Agendamiento
    let totalOportunidades = 0, totalScore = 0, countAgen = 0;
    let conteoABC = { A: 0, B: 0, C: 0 };
    agendamiento.forEach(item => {
      if (item.oportunidadesAprovechadas > 0) { totalOportunidades += item.oportunidadesAprovechadas; countAgen++; }
      totalScore += item.scoreTotal;
      if (item.estatus === 'A') conteoABC.A++;
      else if (item.estatus === 'B') conteoABC.B++;
      else if (item.estatus === 'C') conteoABC.C++;
    });
    const promOportunidades = countAgen ? (totalOportunidades / countAgen).toFixed(1) : 0;
    const promScore = agendamiento.length ? (totalScore / agendamiento.length).toFixed(1) : 0;

    // Satisfacción
    let totalNPS = 0, countNPS = 0, quejasAbiertas = 0, totalDiasCierre = 0, countCerradas = 0;
    satisfaccion.forEach(q => {
      // Si existe tiempoCierre en horas, lo convertimos a días para el KPI
      if (q.tiempoCierre && q.tiempoCierre > 0) {
        totalDiasCierre += q.tiempoCierre / 24;
        countCerradas++;
      }
      if (q.status !== 'CERRADA') quejasAbiertas++;
      // Si hay NPS (columna W es tiempoCierre, no NPS; necesitamos otra fuente)
      // Por ahora, dejamos NPS como 0, lo podemos calcular después si hay datos.
    });

    const promDiasCierre = countCerradas ? (totalDiasCierre / countCerradas).toFixed(1) : 0;
    // Porcentaje de felicitaciones: buscamos en motivo o comentarios
    const felicitaciones = satisfaccion.filter(q => 
      q.motivo?.toLowerCase().includes('felicitacion') || 
      q.comentarios?.toLowerCase().includes('felicitacion')
    ).length;
    const promFelicitaciones = satisfaccion.length ? ((felicitaciones / satisfaccion.length) * 100).toFixed(1) : 0;

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
        nps: 'N/A', // No tenemos NPS en el sheet, lo dejamos como N/A
        felicitaciones: promFelicitaciones,
        quejasAbiertas,
        tiempoCierre: promDiasCierre // en días
      }
    });
  } catch (error) {
    console.error('Error en kpis:', error);
    res.status(500).json({ error: 'Error al calcular KPIs' });
  }
}
