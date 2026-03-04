import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Leer TODAS las columnas de la A a la J
    const data = await getSheetData('COORDINACION_DETALLE!A2:J');
    
    // Mapeo correcto según tu estructura
    let datos = data.map(row => ({
      fecha: row[0],                // A
      mes: row[1],                   // B
      colaborador: row[2],            // C
      unidad: row[3],                 // D
      ftr: row[4] ? parseFloat(row[4]) : 0,     // E
      tiempoPromedio: row[5] ? parseFloat(row[5]) : 0, // F
      cantidadRegistros: row[6] ? parseInt(row[6]) : 0, // G
      noConformidades: row[7] ? parseInt(row[7]) : 0,   // H
      snc: row[8] ? parseInt(row[8]) : 0,               // I
      semaforo: row[9] || 'SIN DEFINIR'                 // J
    }));

    // Filtrar por fecha si se proporciona
    if (fechaInicio && fechaFin && fechaInicio !== 'undefined' && fechaFin !== 'undefined') {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      datos = datos.filter(d => {
        if (!d.fecha) return false;
        const fechaD = new Date(d.fecha);
        return fechaD >= inicio && fechaD <= fin;
      });
    }

    // Log para debugging (opcional)
    console.log(`Coordinación: ${datos.length} registros encontrados`);

    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en API coordinacion:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
