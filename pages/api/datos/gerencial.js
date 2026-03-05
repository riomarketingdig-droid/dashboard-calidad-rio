import { getSheetData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  try {
    const { ano, mes, trimestre, semana } = req.query;
    const data = await getSheetData('GERENCIAL_DATOS!A2:K');
    console.log(`Gerencial: ${data.length} filas leídas`);

    let datos = data.map(row => ({
      fecha: row[0] || '',
      ano: row[1] ? parseInt(row[1]) : null,
      semana: row[2] ? parseInt(row[2]) : null,
      mes: row[3] || '',
      trimestre: row[4] || '',
      indicador: row[5] || '',
      proceso: row[6] || '',
      valor: row[7] ? (isNaN(parseFloat(row[7])) ? row[7] : parseFloat(row[7])) : null,
      meta: row[8] || '',
      estatus: row[9] || '',
      tendencia: row[10] || ''
    }));

    if (ano) {
      const anoNum = parseInt(ano);
      datos = datos.filter(d => d.ano === anoNum);
    }
    if (mes) datos = datos.filter(d => d.mes === mes);
    if (trimestre) datos = datos.filter(d => d.trimestre === trimestre);
    if (semana) datos = datos.filter(d => d.semana === parseInt(semana));

    console.log(`Enviando ${datos.length} registros gerenciales`);
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en gerencial:', error);
    res.status(500).json({ error: 'Error al obtener datos gerenciales' });
  }
}
