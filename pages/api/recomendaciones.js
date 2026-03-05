import { getCoordinacionData, getAgendamientoData, getSatisfaccionData, getColaboradoresData } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [coordinacion, agendamiento, satisfaccion, colaboradores] = await Promise.all([
      getCoordinacionData(),
      getAgendamientoData(),
      getSatisfaccionData(),
      getColaboradoresData()
    ]);

    const recomendaciones = [];

    // ========== Reglas para Coordinación ==========
    coordinacion.forEach(agente => {
      const colabInfo = colaboradores.find(c => c.nombre?.toLowerCase().includes(agente.colaborador?.toLowerCase() || ''));
      const areaBase = 'Coordinación';

      if (agente.ftr < 95) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-ftr-${Date.now()}`,
          nivel: agente.ftr < 90 ? 'URGENTE' : (agente.ftr < 95 ? 'CRÍTICO' : 'ALTO'),
          area: areaBase,
          agente: agente.colaborador,
          metrica: `FTR ${agente.ftr.toFixed(1)}%`,
          sugerencia: 'Revisión diaria de registros con feedback inmediato',
          responsable: 'Coordinador de Calidad',
          plazo: '1 semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Auditar 5 registros diarios', 'Retroalimentación en el momento']
        });
      }

      if (agente.tiempoPromedio > 8) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-tiempo-${Date.now()}`,
          nivel: agente.tiempoPromedio > 10 ? 'URGENTE' : 'ALTO',
          area: areaBase,
          agente: agente.colaborador,
          metrica: `${agente.tiempoPromedio.toFixed(1)} min promedio`,
          sugerencia: 'Taller de atajos y optimización de tiempos',
          responsable: 'Coach de Procesos',
          plazo: 'Esta semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Capacitación en atajos', 'Ejercicios de velocidad']
        });
      }

      if (agente.noConformidades > 2) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-noconf-${Date.now()}`,
          nivel: agente.noConformidades > 5 ? 'URGENTE' : 'CRÍTICO',
          area: areaBase,
          agente: agente.colaborador,
          metrica: `${agente.noConformidades} no conformidades`,
          sugerencia: 'Revisar causas raíz y establecer plan de acción correctiva',
          responsable: 'Coordinador',
          plazo: '3 días',
          fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Análisis de causa raíz', 'Plan de acción']
        });
      }
    });

    // ========== Reglas para Agendamiento ==========
    agendamiento.forEach(asesor => {
      const colabInfo = colaboradores.find(c => c.nombre?.toLowerCase().includes(asesor.asesor?.toLowerCase() || ''));
      const areaBase = 'Agendamiento';

      if (asesor.oportunidadesAprovechadas < 75) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-oportunidades-${Date.now()}`,
          nivel: asesor.oportunidadesAprovechadas < 70 ? 'URGENTE' : 'CRÍTICO',
          area: areaBase,
          agente: asesor.asesor,
          metrica: `${asesor.oportunidadesAprovechadas.toFixed(1)}% oportunidades`,
          sugerencia: 'Sesión de coaching en gestión de oportunidades',
          responsable: 'Coordinador de Ventas',
          plazo: '1 semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Role-play diario', 'Revisión de objeciones']
        });
      }

      if (asesor.noConformidades > 2) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-noconf-${Date.now()}`,
          nivel: asesor.noConformidades > 5 ? 'URGENTE' : 'CRÍTICO',
          area: areaBase,
          agente: asesor.asesor,
          metrica: `${asesor.noConformidades} no conformidades`,
          sugerencia: 'Revisión de procesos y checklist diario',
          responsable: 'Auditor de Calidad',
          plazo: '3 días',
          fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Checklist obligatorio', 'Seguimiento']
        });
      }

      if (asesor.scoreTotal < 70) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-score-${Date.now()}`,
          nivel: asesor.scoreTotal < 60 ? 'URGENTE' : 'ALTO',
          area: areaBase,
          agente: asesor.asesor,
          metrica: `Score ${asesor.scoreTotal}`,
          sugerencia: 'Plan de mejora personalizado',
          responsable: 'Coach',
          plazo: '2 semanas',
          fechaLimite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Diagnóstico', 'Sesiones individuales']
        });
      }
    });

    // ========== Reglas para Satisfacción (quejas) ==========
    satisfaccion.forEach(queja => {
      if (queja.status !== 'CERRADA') {
        recomendaciones.push({
          id: `sat-${queja.id}-${Date.now()}`,
          nivel: 'ALTO',
          area: 'Satisfacción',
          agente: queja.responsableFalla || queja.sucursal,
          metrica: `Queja ${queja.noQueja} - ${queja.motivo}`,
          sugerencia: queja.planAccion || 'Revisar causa raíz y cerrar queja',
          responsable: queja.responsablePlan || 'Coordinador de Calidad',
          plazo: 'Esta semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Cierre de queja', 'Seguimiento']
        });
      }

      // Si el tiempo de cierre excede 2 días (48 horas), recomendación
      if (queja.tiempoCierre && queja.tiempoCierre > 48) {
        recomendaciones.push({
          id: `sat-${queja.id}-tiempo-${Date.now()}`,
          nivel: 'CRÍTICO',
          area: 'Satisfacción',
          agente: queja.responsableFalla || queja.sucursal,
          metrica: `Tiempo cierre ${(queja.tiempoCierre/24).toFixed(1)} días`,
          sugerencia: 'Agilizar proceso de cierre de quejas',
          responsable: queja.responsablePlan || 'Coordinador',
          plazo: 'Inmediato',
          fechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: '',
          acciones: ['Revisar procedimiento', 'Capacitación']
        });
      }
    });

    // Eliminar duplicados (por si acaso)
    const unique = new Map();
    recomendaciones.forEach(r => unique.set(r.id, r));
    const finalRecomendaciones = Array.from(unique.values());

    // Ordenar por nivel
    const ordenNivel = { 'URGENTE': 1, 'CRÍTICO': 2, 'ALTO': 3, 'VERDE': 4 };
    finalRecomendaciones.sort((a, b) => (ordenNivel[a.nivel] || 5) - (ordenNivel[b.nivel] || 5));

    res.status(200).json(finalRecomendaciones);
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    res.status(500).json({ error: 'Error al generar recomendaciones' });
  }
}
