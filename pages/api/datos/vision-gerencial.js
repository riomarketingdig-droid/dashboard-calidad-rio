import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getSheetData('VISION_GERENCIAL!A2:R');
    
    const vision = data.map(row => ({
      indicador: row[0],
      proceso: row[1],
      meta: row[2],
      enero: row[3],
      febrero: row[4],
      marzo: row[5],
      abril: row[6],
      mayo: row[7],
      junio: row[8],
      julio: row[9],
      agosto: row[10],
      septiembre: row[11],
      octubre: row[12],
      noviembre: row[13],
      diciembre: row[14],
      tendencia: row[15],
      responsable: row[16],
      estatus: row[17]
    }));

    res.status(200).json(vision);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener visión gerencial' });
  }
}
