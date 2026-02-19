import { getCoordinacionData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getCoordinacionData();
    
    // Filtros opcionales
    const { unidad, semaforo } = req.query;
    
    let filteredData = data;
    if (unidad) filteredData = filteredData.filter(d => d.unidad === unidad);
    if (semaforo) filteredData = filteredData.filter(d => d.semaforo === semaforo);
    
    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error en API coordinacion:', error);
    res.status(500).json({ error: 'Error al obtener datos de coordinación' });
  }
}
