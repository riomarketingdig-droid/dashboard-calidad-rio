import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fechaInicio, fechaFin, sucursal, proceso, status } = req.query;
    const data = await getSheetData('SATISFACCION_CLIENTE!A2:W');
    
    let quejas = data.map((row, index) => ({
      id: `Q-${index + 1}`,
      noQueja: row[0],
      noQuejaCompleto: row[1],
      mes: row[2],
      semana: row[3] ? parseInt(row[3]) : null,
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
      status: row[20] || 'PENDIENTE',
      fechaCierre: row[21],
      tiempoCierre: row[22] ? parseFloat(row[22]) : null
    }));

    // Aplicar filtros
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      quejas = quejas.filter(q => {
        const fechaQ = new Date(q.fechaRecepcion);
        return fechaQ >= inicio && fechaQ <= fin;
      });
    }
    if (sucursal && sucursal !== 'TODAS') quejas = quejas.filter(q => q.sucursal === sucursal);
    if (proceso && proceso !== 'TODOS') quejas = quejas.filter(q => q.proceso === proceso);
    if (status && status !== 'TODOS') quejas = quejas.filter(q => q.status === status);

    res.status(200).json(quejas);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos de satisfacción' });
  }
}
