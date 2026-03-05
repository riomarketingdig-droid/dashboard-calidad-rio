import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Obtener datos de las diferentes hojas
    const coordinacion = await getSheetData('COORDINACION_DETALLE!A2:J');
    const agendamiento = await getSheetData('AGENDAMIENTO_DETALLE!A2:O');
    const satisfaccion = await getSheetData('SATISFACCION_CLIENTE!A2:W');

    // Procesar coordinación
    let totalCoords = 0;
    let sumaFTR = 0;
    let sumaTiempo = 0;
    let totalNoConformidades = 0;

    coordinacion.forEach(row => {
      const ftr = parseFloat(row[4]) || 0;
      const tiempo = parseFloat(row[5]) || 0;
      const noConf = parseInt(row[7]) || 0;
      if (row[0]) { // tiene fecha
        totalCoords++;
        sumaFTR += ftr;
        sumaTiempo += tiempo;
        totalNoConformidades += noConf;
      }
    });

    const ftrPromedio = totalCoords ? (sumaFTR / totalCoords).toFixed(1) : 0;
    const tiempoPromedio = totalCoords ? (sumaTiempo / totalCoords).toFixed(1) : 0;

    // Procesar agendamiento
    let totalAgentes = 0;
    let sumaConversion = 0;
    let sumaScore = 0;
    let distribucion = { A: 0, B: 0, C: 0 };

    agendamiento.forEach(row => {
      const conversion = parseFloat(row[5]) || 0; // oportunidadesAprovechadas
      const score = parseFloat(row[13]) || 0;
      const estatus = row[12];
      if (row[0]) { // tiene fecha
        totalAgentes++;
        sumaConversion += conversion;
        sumaScore += score;
        if (estatus === 'A') distribucion.A++;
        else if (estatus === 'B') distribucion.B++;
        else if (estatus === 'C') distribucion.C++;
      }
    });

    const conversionPromedio = totalAgentes ? (sumaConversion / totalAgentes).toFixed(1) : 0;
    const scorePromedio = totalAgentes ? (sumaScore / totalAgentes).toFixed(1) : 0;

    // Procesar satisfacción
    let totalQuejas = 0;
    let sumaNPS = 0; // Asumiendo que NPS está en alguna columna, si no, calculamos otro indicador
    let felicitaciones = 0;
    let quejasAbiertas = 0;
    let sumaTiempoCierre = 0;
    let quejasCerradas = 0;

    satisfaccion.forEach(row => {
      const status = row[20] || 'PENDIENTE';
      const tiempoCierre = parseFloat(row[22]) || 0;
      if (row[0]) {
        totalQuejas++;
        if (status === 'CERRADA') {
          quejasCerradas++;
          sumaTiempoCierre += tiempoCierre;
        } else {
          quejasAbiertas++;
        }
        // Supongamos que felicitaciones es un campo booleano en alguna columna, aquí lo dejamos como ejemplo
        // Si no existe, podemos omitirlo o calcular de otra forma
      }
    });

    const npsPromedio = (quejasCerradas ? (sumaTiempoCierre / quejasCerradas).toFixed(1) : 0); // Usamos tiempo cierre como proxy
    const tiempoCierrePromedio = quejasCerradas ? (sumaTiempoCierre / quejasCerradas).toFixed(0) : 0;

    // Construir respuesta simulando estructura de VISION_GERENCIAL
    const vision = [
      { indicador: 'Efectividad promedio (Coordinación)', proceso: 'Coordinación', valor: ftrPromedio + '%', meta: '98%', tendencia: 'up' },
      { indicador: 'Tiempo promedio (Coordinación)', proceso: 'Coordinación', valor: tiempoPromedio + ' min', meta: '7 min', tendencia: 'down' },
      { indicador: 'No Conformidades totales', proceso: 'Coordinación', valor: totalNoConformidades.toString(), meta: '0', tendencia: 'down' },
      { indicador: '% Conversión promedio (Agendamiento)', proceso: 'Agendamiento', valor: conversionPromedio + '%', meta: '95%', tendencia: 'up' },
      { indicador: 'Score promedio', proceso: 'Agendamiento', valor: scorePromedio, meta: '9.0', tendencia: 'up' },
      { indicador: 'Distribución A/B/C', proceso: 'Agendamiento', valor: `A:${distribucion.A} B:${distribucion.B} C:${distribucion.C}`, meta: '-', tendencia: 'neutral' },
      { indicador: 'Quejas abiertas', proceso: 'Satisfacción', valor: quejasAbiertas.toString(), meta: '0', tendencia: 'down' },
      { indicador: 'Tiempo cierre promedio (hrs)', proceso: 'Satisfacción', valor: tiempoCierrePromedio, meta: '48', tendencia: 'down' },
    ];

    res.status(200).json(vision);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener visión gerencial' });
  }
}
