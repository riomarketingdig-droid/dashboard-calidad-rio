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

    // Reglas para Coordinación
    coordinacion.forEach(agente => {
      if (agente.efectividadSIO < 95) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-efectividad`,
          nivel: 'CRÍTICO',
          area: 'Calidad de Registro',
          agente: agente.colaborador,
          metrica: `${agente.efectividadSIO.toFixed(1)}% efectividad`,
          sugerencia: 'Revisión diaria de 5 registros con feedback inmediato',
          responsable: 'Coordinador de Calidad',
          plazo: 'Inmediato',
          fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Auditar 5 registros diarios',
            'Retroalimentación en el momento',
            'Documentar mejora'
          ]
        });
      }

      if (agente.tiempoPromedio > 8) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-tiempo`,
          nivel: 'ALTO',
          area: 'Velocidad de Registro',
          agente: agente.colaborador,
          metrica: `${agente.tiempoPromedio.toFixed(1)} min promedio`,
          sugerencia: 'Taller de atajos y optimización de tiempos',
          responsable: 'Coach de Procesos',
          plazo: 'Esta semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Capacitación en atajos del sistema',
            'Ejercicios de velocidad controlada',
            'Seguimiento de tiempo por 5 días'
          ]
        });
      }

      if (agente.reincidencias >= 2) {
        recomendaciones.push({
          id: `coord-${agente.colaborador}-reincidencia`,
          nivel: 'URGENTE',
          area: 'Disciplina Operativa',
          agente: agente.colaborador,
          metrica: `${agente.reincidencias} reincidencias`,
          sugerencia: 'Aplicar plan de mejora según regla de reincidencia',
          responsable: 'Coordinador',
          plazo: '24 horas',
          fechaLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Reunión one-on-one',
            'Establecer metas claras',
            'Seguimiento cada 3 días'
          ]
        });
      }
    });

    // Reglas para Agendamiento
    agendamiento.forEach(asesor => {
      if (asesor.conversion < 50) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-conversion`,
          nivel: 'CRÍTICO',
          area: 'Conversión de Ventas',
          agente: asesor.asesor,
          metrica: `${asesor.conversion.toFixed(1)}% conversión`,
          sugerencia: 'Programar sesión diaria de role-play enfocada en objeciones comunes',
          responsable: 'Coordinador de Ventas',
          plazo: 'Inmediato',
          fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Role-play 30 min diarios',
            'Revisión de objeciones frecuentes',
            'Grabar y analizar llamadas'
          ]
        });
      }

      const totalHallazgos = (asesor.hallazgosCitas || 0) + 
                            (asesor.hallazgosCotizacion || 0) + 
                            (asesor.hallazgosAgendas || 0);
      
      if (totalHallazgos > 3) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-hallazgos`,
          nivel: 'ALTO',
          area: 'Calidad de Gestión',
          agente: asesor.asesor,
          metrica: `${totalHallazgos} hallazgos en auditoría`,
          sugerencia: 'Revisión de 5 llamadas grabadas por semana con feedback estructurado',
          responsable: 'Auditor de Calidad',
          plazo: 'Esta semana',
          fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Auditar 5 llamadas semanales',
            'Formato de feedback estandarizado',
            'Plan de acción correctiva'
          ]
        });
      }

      if (asesor.reincidencias >= 2) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-reincidencia`,
          nivel: 'URGENTE',
          area: 'Disciplina Comercial',
          agente: asesor.asesor,
          metrica: `${asesor.reincidencias} reincidencias`,
          sugerencia: 'Aplicar acta administrativa según regla de reincidencia',
          responsable: 'Coordinador',
          plazo: '24 horas',
          fechaLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Documentar incidencias',
            'Notificación formal',
            'Plan de mejora forzoso'
          ]
        });
      }

      if (asesor.conversion > 60 && totalHallazgos === 0 && asesor.reincidencias === 0) {
        recomendaciones.push({
          id: `agen-${asesor.asesor}-excelencia`,
          nivel: 'VERDE',
          area: 'Reconocimiento',
          agente: asesor.asesor,
          metrica: `${asesor.conversion.toFixed(1)}% conversión`,
          sugerencia: 'Destacar como mentor y compartir mejores prácticas',
          responsable: 'Gerencia',
          plazo: 'Este mes',
          fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          acciones: [
            'Reconocimiento público',
            'Asignar como mentor',
            'Documentar sus prácticas'
          ]
        });
      }
    });

    // Ordenar por nivel de prioridad
    const ordenNivel = { 'URGENTE': 1, 'CRÍTICO': 2, 'ALTO': 3, 'VERDE': 4 };
    recomendaciones.sort((a, b) => ordenNivel[a.nivel] - ordenNivel[b.nivel]);

    res.status(200).json(recomendaciones);
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    res.status(500).json({ error: 'Error al generar recomendaciones' });
  }
}
