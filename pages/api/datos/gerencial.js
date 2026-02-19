import { getGerencialData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const data = await getGerencialData();

    // Aceptar tanto 'ano' como 'año' por si hay problemas de encoding
    const { mes, trimestre, semana, ano, año } = req.query;
    const anioFiltro = ano || año;

    let filteredData = data;

    if (anioFiltro) filteredData = filteredData.filter(d => d.año === parseInt(anioFiltro));
    if (mes) filteredData = filteredData.filter(d => d.mes === mes);
    if (trimestre) {
      // Mapear Q1 (Ene-Mar) → Q1, etc.
      const trimestreSimple = trimestre.replace(/ \(.*\)/, '');
      filteredData = filteredData.filter(d => d.trimestre === trimestre || d.trimestre === trimestreSimple);
    }
    if (semana) filteredData = filteredData.filter(d => d.semana === parseInt(semana));

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error en API gerencial:', error);
    res.status(500).json({ error: 'Error al obtener datos gerenciales' });
  }
}
