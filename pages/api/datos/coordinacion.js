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

function calcularSemaforo(ftr, tiempo, noConf) {
  if (ftr >= 98 && tiempo <= 7 && noConf === 0) return 'VERDE';
  if (ftr >= 95 || tiempo <= 8 || noConf <= 2) return 'AMARILLO';
  return 'ROJO';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fechaInicio, fechaFin } = req.query;
    const data = await getSheetData('COORDINACION_DETALLE!A2:J');

    let datos = data.map(row => {
      const ftr = row[4] ? parseFloat(row[4]) : 0;
      const tiempo = row[5] ? parseFloat(row[5]) : 0;
      const noConf = row[7] ? parseInt(row[7]) : 0;
      const semaforoSheet = row[9] || '';
      // Si el sheet no trae semáforo válido, lo calculamos
      const semaforoValido = ['VERDE', 'AMARILLO', 'ROJO'].includes(semaforoSheet) ? semaforoSheet : calcularSemaforo(ftr, tiempo, noConf);

      return {
        fecha: row[0],
        fechaObj: parseFecha(row[0]),
        mes: row[1],
        colaborador: row[2],
        unidad: row[3],
        ftr,
        tiempoPromedio: tiempo,
        cantidadRegistros: row[6] ? parseInt(row[6]) : 0,
        noConformidades: noConf,
        snc: row[8] ? parseInt(row[8]) : 0,
        semaforo: semaforoValido
      };
    });

    if (fechaInicio && fechaFin && fechaInicio !== 'undefined' && fechaFin !== 'undefined') {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      datos = datos.filter(d => d.fechaObj && d.fechaObj >= inicio && d.fechaObj <= fin);
    }

    datos = datos.map(({ fechaObj, ...rest }) => rest);
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en coordinacion:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
