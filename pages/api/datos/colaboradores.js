import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getSheetData('COLABORADORES!A2:I');
    
    const colaboradores = data.map(row => ({
      nombre: row[0],
      area: row[1],
      unidad: row[2],
      puesto: row[3],
      jefeInmediato: row[4],
      emailColaborador: row[5],
      emailJefe: row[6],
      fechaIngreso: row[7],
      activo: row[8] === 'TRUE'
    }));

    res.status(200).json(colaboradores);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener colaboradores' });
  }
}
