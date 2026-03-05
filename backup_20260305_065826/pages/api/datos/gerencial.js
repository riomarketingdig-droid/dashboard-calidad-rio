import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ano, mes, trimestre, semana } = req.query;
    const data = await getSheetData('GERENCIAL_DATOS!A2:K');
    
    let datos = data.map(row => ({
      fecha: row[0],
      año: parseInt(row[1]),
      semana: parseInt(row[2]),
      mes: row[3],
      trimestre: row[4],
      indicador: row[5],
      proceso: row[6],
      valor: parseFloat(row[7]) || 0,
      meta: row[8],
      estatus: row[9],
      tendencia: row[10]
    }));

    // Aplicar filtros
    if (ano) datos = datos.filter(d => d.año === parseInt(ano));
    if (mes) datos = datos.filter(d => d.mes === mes);
    if (trimestre) datos = datos.filter(d => d.trimestre === trimestre);
    if (semana) datos = datos.filter(d => d.semana === parseInt(semana));

    res.status(200).json(datos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos gerenciales' });
  }
}
