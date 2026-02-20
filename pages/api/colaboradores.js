import { getColaboradoresData } from '../../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await getColaboradoresData();
    const { nombre } = req.query;

    if (nombre) {
      const colaborador = data.find(c =>
        c.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      return res.status(200).json(colaborador || null);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
