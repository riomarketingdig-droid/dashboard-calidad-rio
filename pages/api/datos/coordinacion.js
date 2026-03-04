import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getSheetData('COORDINACION_DETALLE!A2:J');
    
    const coordinacion = data.map(row => ({
      fecha: row[0],
      mes: row[1],
      colaborador: row[2],
      unidad: row[3],
      ftr: row[4],
      tiempoPromedio: row[5],
      cantidadRegistros: row[6],
      noConformidades: row[7],
      snc: row[8],
      semaforo: row[9]
    }));

    res.status(200).json(coordinacion);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
