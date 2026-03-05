import { getCoordinacionData, getAgendamientoData } from '../../lib/googleSheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [coordinacion, agendamiento] = await Promise.all([
      getCoordinacionData(),
      getAgendamientoData()
    ]);

    const recomendaciones = [];

    // ---- Coordinación ----
    coordinacion.forEach(agente => {
      // URGENTE: reincidencias >= 2
      if (agente.reincidencias >= 2) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-reincidencia`,
          nivel: 'URGENTE',
          area: 'Coordinación',
          agente: agente.colaborador,
          metrica: `${agente.reincidencias} reincidencias`,
          sugerencia: 'Aplicar plan de mejora según regla de reincidencia',
          responsable: 'Coordinador de Calidad',
          plazo: '24 horas',
          fechaLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
      // CRÍTICO: FTR < 95%
      else if (agente.ftr < 95) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-ftr`,
          nivel: 'CRÍTICO',
          area: 'Coordinación',
          agente: agente.colaborador,
          metrica: `FTR ${agente.ftr.toFixed(1)}%`,
          sugerencia: 'Revisión diaria de 5 registros con feedback inmediato',
          responsable: 'Coordinador de Calidad',
          plazo: 'Inmediato',
          fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
      // ALTO: tiempo > 8 min
      else if (agente.tiempoPromedio > 8) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-tiempo`,
          nivel: 'ALTO',
          area: 'Coordinación',
          agente: agente.colaborador,
          metrica: `${agente.tiempoPromedio.toFixed(1)} min promedio`,
          sugerencia: 'Taller de atajos y optimización de tiempos',
          responsable: 'Coach de Procesos',
          plazo: 'Esta semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
      // VERDE: buen desempeño (opcional)
      else if (agente.ftr >= 98 && agente.tiempoPromedio <= 7 && agente.noConformidades === 0) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-excelente`,
          nivel: 'VERDE',
          area: 'Coordinación',
          agente: agente.colaborador,
          metrica: `FTR ${agente.ftr.toFixed(1)}%`,
          sugerencia: 'Destacar como ejemplo y compartir buenas prácticas',
          responsable: 'Gerencia',
          plazo: 'Este mes',
          fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
    });

    // ---- Agendamiento ----
    agendamiento.forEach(asesor => {
      // URGENTE: reincidencias >= 2
      if (asesor.reincidencias >= 2) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-reincidencia`,
          nivel: 'URGENTE',
          area: 'Agendamiento',
          agente: asesor.asesor,
          metrica: `${asesor.reincidencias} reincidencias`,
          sugerencia: 'Aplicar acta administrativa según regla de reincidencia',
          responsable: 'Coordinador',
          plazo: '24 horas',
          fechaLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
      // CRÍTICO: score < 70
      else if (asesor.scoreTotal < 70) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-score`,
          nivel: 'CRÍTICO',
          area: 'Agendamiento',
          agente: asesor.asesor,
          metrica: `Score ${asesor.scoreTotal}`,
          sugerencia: 'Programar sesión diaria de role-play enfocada en objeciones comunes',
          responsable: 'Coordinador de Ventas',
          plazo: 'Inmediato',
          fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
      // ALTO: muchos hallazgos (por ejemplo, efectividadHallazgos < 90%)
      else if (asesor.efectividadHallazgos < 90) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-hallazgos`,
          nivel: 'ALTO',
          area: 'Agendamiento',
          agente: asesor.asesor,
          metrica: `Efectividad Hallazgos ${asesor.efectividadHallazgos.toFixed(1)}%`,
          sugerencia: 'Revisión de 5 llamadas grabadas por semana con feedback estructurado',
          responsable: 'Auditor de Calidad',
          plazo: 'Esta semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
      // VERDE: score >= 90
      else if (asesor.scoreTotal >= 90) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-excelente`,
          nivel: 'VERDE',
          area: 'Agendamiento',
          agente: asesor.asesor,
          metrica: `Score ${asesor.scoreTotal}`,
          sugerencia: 'Destacar como mentor y compartir mejores prácticas',
          responsable: 'Gerencia',
          plazo: 'Este mes',
          fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          feedback: ''
        });
      }
    });

    // Ordenar por prioridad
    const ordenNivel = { 'URGENTE': 1, 'CRÍTICO': 2, 'ALTO': 3, 'VERDE': 4 };
    recomendaciones.sort((a, b) => ordenNivel[a.nivel] - ordenNivel[b.nivel]);

    res.status(200).json(recomendaciones);
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    res.status(500).json({ error: 'Error al generar recomendaciones' });
  }
}
