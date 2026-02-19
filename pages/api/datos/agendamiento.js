import { getAgendamientoData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getAgendamientoData();
    
    // Filtros opcionales
    const { semaforo, estatus } = req.query;
    
    let filteredData = data;
    if (semaforo) filteredData = filteredData.filter(d => d.semaforo === semaforo);
    if (estatus) filteredData = filteredData.filter(d => d.estatus === estatus);
    
    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error en API agendamiento:', error);
    res.status(500).json({ error: 'Error al obtener datos de agendamiento' });
  }
}
