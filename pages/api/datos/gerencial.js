import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  try {
    const { ano } = req.query; // Nota: el parámetro se llama 'ano' (sin tilde)
    let data = await getSheetData('GERENCIAL_DATOS!A2:K');

    let registros = data.map(row => ({
      fecha: row[0],
      año: row[1] ? parseInt(row[1]) : null,
      semana: row[2] ? parseInt(row[2]) : null,
      mes: row[3],
      trimestre: row[4],
      indicador: row[5],
      proceso: row[6],
      valor: row[7] ? (isNaN(parseFloat(row[7])) ? row[7] : parseFloat(row[7])) : null,
      meta: row[8],
      estatus: row[9],
      tendencia: row[10]
    }));

    // Filtrar por año si se proporciona
    if (ano) {
      const anoNum = parseInt(ano);
      registros = registros.filter(r => r.año === anoNum);
    }

    res.status(200).json(registros);
  } catch (error) {
    console.error('Error en gerencial:', error);
    res.status(500).json({ error: 'Error al obtener datos gerenciales' });
  }
}
