import { getSheetData } from '../../../lib/googleSheets';

// Función para convertir fecha DD/MM/YYYY a objeto Date
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const [dia, mes, anio] = partes;
    return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const data = await getSheetData('COORDINACION_DETALLE!A2:J');
    
    let datos = data.map(row => ({
      fecha: row[0],                // string original
      fechaObj: parseFecha(row[0]),  // para filtrar
      mes: row[1],
      colaborador: row[2],
      unidad: row[3],
      ftr: row[4] ? parseFloat(row[4]) : 0,
      tiempoPromedio: row[5] ? parseFloat(row[5]) : 0,
      cantidadRegistros: row[6] ? parseInt(row[6]) : 0,
      noConformidades: row[7] ? parseInt(row[7]) : 0,
      snc: row[8] ? parseInt(row[8]) : 0,
      semaforo: row[9] || 'SIN DEFINIR'
    }));

    // Filtrar por fecha si se proporciona
    if (fechaInicio && fechaFin && fechaInicio !== 'undefined' && fechaFin !== 'undefined') {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      datos = datos.filter(d => {
        if (!d.fechaObj) return false;
        return d.fechaObj >= inicio && d.fechaObj <= fin;
      });
    }

    // Eliminar el campo auxiliar antes de enviar
    datos = datos.map(({ fechaObj, ...rest }) => rest);

    console.log(`Coordinación: ${datos.length} registros encontrados`);

    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en API coordinacion:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
