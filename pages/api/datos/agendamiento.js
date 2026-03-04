import { getSheetData } from '../../../lib/googleSheets';

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
    const data = await getSheetData('AGENDAMIENTO_DETALLE!A2:O');
    
    let datos = data.map(row => ({
      fecha: row[0],
      fechaObj: parseFecha(row[0]),
      mes: row[1],
      semana: parseInt(row[2]),
      asesor: row[3],
      citasAgendadas: parseInt(row[4]) || 0,
      oportunidadesAprovechadas: parseFloat(row[5]) || 0,
      hallazgosCotizacion: parseFloat(row[6]) || 0,
      hallazgosVenta: parseFloat(row[7]) || 0,
      efectividadHallazgos: parseFloat(row[8]) || 0,
      snc: parseInt(row[9]) || 0,
      noConformidades: parseInt(row[10]) || 0,
      efectividadAgendamiento: parseFloat(row[11]) || 0,
      estatus: row[12],
      scoreTotal: parseFloat(row[13]) || 0
    }));

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      datos = datos.filter(d => {
        if (!d.fechaObj) return false;
        return d.fechaObj >= inicio && d.fechaObj <= fin;
      });
    }

    datos = datos.map(({ fechaObj, ...rest }) => rest);
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos de agendamiento' });
  }
}
