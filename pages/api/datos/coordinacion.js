import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fechaInicio, fechaFin } = req.query;
    const data = await getSheetData('COORDINACION_DETALLE!A2:J');
    
    let datos = data.map(row => ({
      fecha: row[0],
      mes: row[1],
      colaborador: row[2],
      unidad: row[3],
      ftr: parseFloat(row[4]) || 0,
      tiempoPromedio: parseFloat(row[5]) || 0,
      cantidadRegistros: parseInt(row[6]) || 0,
      noConformidades: parseInt(row[7]) || 0,
      snc: parseInt(row[8]) || 0,
      semaforo: row[9]
    }));

    // Filtrar por fecha
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      datos = datos.filter(d => {
        const fechaD = new Date(d.fecha);
        return fechaD >= inicio && fechaD <= fin;
      });
    }

    res.status(200).json(datos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
