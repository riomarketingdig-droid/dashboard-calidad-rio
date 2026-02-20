import {
  getSeguimientoData,
  guardarSeguimiento,
  cerrarSeguimiento,
  actualizarEmailEnviado
} from '../../../lib/googleSheets';

export default async function handler(req, res) {

  // GET — traer todos los seguimientos
  if (req.method === 'GET') {
    try {
      const { recomendacionId, colaborador } = req.query;
      let data = await getSeguimientoData();

      if (recomendacionId) data = data.filter(s => s.recomendacionId === recomendacionId);
      if (colaborador) data = data.filter(s => s.colaborador === colaborador);

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST — guardar nueva nota/acuerdo
  if (req.method === 'POST') {
    try {
      const datos = req.body;
      if (!datos.colaborador || !datos.recomendacionId) {
        return res.status(400).json({ error: 'Faltan campos requeridos: colaborador, recomendacionId' });
      }
      const id = await guardarSeguimiento(datos);
      if (!id) return res.status(500).json({ error: 'No se pudo guardar en Google Sheets' });
      return res.status(200).json({ id, mensaje: 'Seguimiento guardado correctamente' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH — cerrar/completar un seguimiento
  if (req.method === 'PATCH') {
    try {
      const { id, accion, quienCerro } = req.body;
      if (!id) return res.status(400).json({ error: 'Falta el ID del seguimiento' });

      if (accion === 'cerrar') {
        const ok = await cerrarSeguimiento(id, quienCerro || 'Sistema');
        if (!ok) return res.status(404).json({ error: 'Seguimiento no encontrado' });
        return res.status(200).json({ mensaje: 'Seguimiento cerrado correctamente' });
      }

      if (accion === 'emailEnviado') {
        await actualizarEmailEnviado(id);
        return res.status(200).json({ mensaje: 'Email marcado como enviado' });
      }

      return res.status(400).json({ error: 'Accion no reconocida' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
