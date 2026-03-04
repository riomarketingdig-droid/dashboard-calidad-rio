import { getCoordinacionData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const data = await getCoordinacionData();
    const { unidad, semaforo, fechaInicio, fechaFin, mes, año, semana } = req.query;

    let filteredData = data;

    // Filtro por período usando la fecha del registro
    if (fechaInicio || fechaFin) {
      filteredData = filteredData.filter(d => {
        if (!d.fecha) return false;
        // Parsear fecha del formato DD/MM/YYYY o MM/DD/YYYY
        const partes = d.fecha.split('/');
        let fecha;
        if (partes.length === 3) {
          // Intentar DD/MM/YYYY primero (formato latinoamericano)
          fecha = new Date(`${partes[2]}-${partes[1].padStart(2,'0')}-${partes[0].padStart(2,'0')}`);
          if (isNaN(fecha)) {
            // Fallback MM/DD/YYYY
            fecha = new Date(d.fecha);
          }
        } else {
          fecha = new Date(d.fecha);
        }
        if (isNaN(fecha)) return false;
        if (fechaInicio && fecha < new Date(fechaInicio)) return false;
        if (fechaFin && fecha > new Date(fechaFin)) return false;
        return true;
      });
    }

    // Filtros adicionales
    if (unidad) filteredData = filteredData.filter(d => d.unidad === unidad);
    if (semaforo) filteredData = filteredData.filter(d => d.semaforo === semaforo);

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error en API coordinacion:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
