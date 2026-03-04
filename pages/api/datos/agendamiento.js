import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getSheetData('AGENDAMIENTO_DETALLE!A2:O');
    
    const agendamiento = data.map(row => ({
      fecha: row[0],
      mes: row[1],
      semana: row[2],
      asesor: row[3],
      citasAgendadas: row[4],
      oportunidadesAprovechadas: row[5],
      hallazgosCotizacion: row[6],
      hallazgosVenta: row[7],
      efectividadHallazgos: row[8],
      snc: row[9],
      noConformidades: row[10],
      efectividadAgendamiento: row[11],
      estatus: row[12],
      scoreTotal: row[13]
    }));

    res.status(200).json(agendamiento);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos de agendamiento' });
  }
}
