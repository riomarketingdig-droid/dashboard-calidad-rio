import { getGerencialData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getGerencialData();
    
    // Filtros opcionales desde la URL
    const { mes, trimestre, semana, año } = req.query;
    
    let filteredData = data;
    if (mes) filteredData = filteredData.filter(d => d.mes === mes);
    if (trimestre) filteredData = filteredData.filter(d => d.trimestre === trimestre);
    if (semana) filteredData = filteredData.filter(d => d.semana === parseInt(semana));
    if (año) filteredData = filteredData.filter(d => d.año === parseInt(año));
    
    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error en API gerencial:', error);
    res.status(500).json({ error: 'Error al obtener datos gerenciales' });
  }
}
