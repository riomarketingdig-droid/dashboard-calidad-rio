import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getSheetData('SATISFACCION_CLIENTE!A2:W');
    
    const quejas = data.map(row => ({
      noQueja: row[0],
      noQuejaCompleto: row[1],
      mes: row[2],
      semana: row[3],
      fechaRecepcion: row[4],
      sucursal: row[5],
      empresa: row[6],
      procedencia: row[7],
      proceso: row[8],
      subProceso: row[9],
      motivo: row[10],
      comentarios: row[11],
      causaRaiz: row[12],
      planAccion: row[13],
      responsablePlan: row[14],
      descripcion: row[15],
      cita: row[16],
      modalidad: row[17],
      responsableFalla: row[18],
      accionCorrectiva: row[19],
      status: row[20],
      fechaCierre: row[21],
      tiempoCierre: row[22]
    }));

    res.status(200).json(quejas);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos de satisfacción' });
  }
}
