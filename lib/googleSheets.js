import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ========== LECTURA GENÉRICA ==========
export async function getSheetData(range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

// ========== ESCRITURA ==========
export async function appendSheetRow(range, values) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
    return true;
  } catch (error) {
    console.error('Error appending row:', error);
    return false;
  }
}

export async function updateSheetRow(range, values) {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
    return true;
  } catch (error) {
    console.error('Error updating row:', error);
    return false;
  }
}

// ========== GERENCIAL ==========
export async function getGerencialData() {
  const data = await getSheetData('GERENCIAL_DATOS!A2:K');
  return data.map(row => ({
    fecha: row[0],
    año: parseInt(row[1]),
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
}

// ========== COORDINACIÓN DETALLE ==========
// Columnas: A:Fecha, B:Mes, C:Colaborador, D:Unidad, E:FTR, F:TiempoPromedio, G:CantidadRegistros, H:NoConformidades, I:SNC, J:SEMAFORO
export async function getCoordinacionData() {
  const data = await getSheetData('COORDINACION_DETALLE!A2:J');
  return data.map(row => ({
    fecha: row[0],
    mes: row[1],
    colaborador: row[2],
    unidad: row[3],
    ftr: row[4] ? parseFloat(row[4]) : 0,
    tiempoPromedio: row[5] ? parseFloat(row[5]) : 0,
    cantidadRegistros: row[6] ? parseInt(row[6]) : 0,
    noConformidades: row[7] ? parseInt(row[7]) : 0,
    snc: row[8] ? parseInt(row[8]) : 0,
    semaforo: row[9] || 'SIN DEFINIR'
  }));
}

// ========== AGENDAMIENTO DETALLE ==========
// Columnas: A:Fecha, B:Mes, C:Semana, D:Asesor, E:CitasAgendadas, F:%Oportunidades, G:HallCotiz, H:HallVenta, I:%EfectAud, J:SNC, K:NoConf, L:%EfectAgend, M:Estatus, N:ScoreTotal
export async function getAgendamientoData() {
  const data = await getSheetData('AGENDAMIENTO_DETALLE!A2:N');
  return data.map(row => ({
    fecha: row[0],
    mes: row[1],
    semana: row[2] ? parseInt(row[2]) : null,
    asesor: row[3],
    citasAgendadas: row[4] ? parseInt(row[4]) : 0,
    oportunidadesAprovechadas: row[5] ? parseFloat(row[5]) : 0,
    hallazgosCotizacion: row[6] ? parseFloat(row[6]) : 0,
    hallazgosVenta: row[7] ? parseFloat(row[7]) : 0,
    efectividadHallazgos: row[8] ? parseFloat(row[8]) : 0,
    snc: row[9] ? parseInt(row[9]) : 0,
    noConformidades: row[10] ? parseInt(row[10]) : 0,
    efectividadAgendamiento: row[11] ? parseFloat(row[11]) : 0,
    estatus: row[12] || '',
    scoreTotal: row[13] ? parseFloat(row[13]) : 0
  }));
}

// ========== SATISFACCIÓN CLIENTE ==========
// Columnas según tu estructura: 
// A:NO, B:NO_QUEJA, C:Mes, D:Semana, E:FechaRecepcion, F:Sucursal, G:Empresa, H:Procedencia, I:Proceso, J:SubProceso, K:Motivo, L:Comentarios, M:CausaRaiz, N:PlanAccion, O:ResponsablePlan, P:Descripcion, Q:CITA, R:Modalidad, S:ResponsableFalla, T:AccionCorrectiva, U:Status, V:FechaCierre, W:TiempoCierre
export async function getSatisfaccionData() {
  const data = await getSheetData('SATISFACCION_CLIENTE!A2:W');
  return data.map((row, index) => ({
    id: `Q-${index + 1}`,
    noQueja: row[0] || '',
    noQuejaCompleto: row[1] || '',
    mes: row[2] || '',
    semana: row[3] ? parseInt(row[3]) : null,
    fechaRecepcion: row[4] || '',
    sucursal: row[5] || '',
    empresa: row[6] || '',
    procedencia: row[7] || '',
    proceso: row[8] || '',
    subProceso: row[9] || '',
    motivo: row[10] || '',
    comentarios: row[11] || '',
    causaRaiz: row[12] || '',
    planAccion: row[13] || '',
    responsablePlan: row[14] || '',
    descripcion: row[15] || '',
    cita: row[16] || '',
    modalidad: row[17] || '',
    responsableFalla: row[18] || '',
    accionCorrectiva: row[19] || '',
    status: row[20] || 'PENDIENTE',
    fechaCierre: row[21] || '',
    tiempoCierre: row[22] ? parseFloat(row[22]) : null
  }));
}

// ========== COLABORADORES ==========
// Columnas: A:Nombre, B:Area, C:Unidad, D:Puesto, E:JefeInmediato, F:EmailColaborador, G:EmailJefe, H:FechaIngreso, I:Activo
export async function getColaboradoresData() {
  const data = await getSheetData('COLABORADORES!A2:I');
  return data.map(row => ({
    nombre: row[0] || '',
    area: row[1] || '',
    unidad: row[2] || '',
    puesto: row[3] || '',
    jefeInmediato: row[4] || '',
    emailColaborador: row[5] || '',
    emailJefe: row[6] || '',
    fechaIngreso: row[7] || '',
    activo: (row[8] || 'SI').toUpperCase() === 'SI'
  }));
}

// ========== SEGUIMIENTO IA (Recomendaciones) ==========
// Pestaña SEGUIMIENTO_IA: A:Fecha, B:Colaborador, C:NivelRiesgo, D:KPI, E:PlanAccion, F:Compromiso, G:Estatus
export async function getRecomendacionesData() {
  const data = await getSheetData('SEGUIMIENTO_IA!A2:G');
  return data.map((row, idx) => ({
    id: `rec-${idx}`,
    fecha: row[0] || '',
    colaborador: row[1] || '',
    nivel: row[2] || 'ALTO',
    kpi: row[3] || '',
    plan: row[4] || '',
    compromiso: row[5] || '',
    estatus: row[6] || 'PENDIENTE'
  }));
}

// ========== SEGUIMIENTO (sesiones) ==========
// Columnas: A:ID, B:FechaRegistro, C:Colaborador, D:Area, E:Nivel, F:Metrica, G:Notas, H:Acuerdos, I:FechaCompromiso, J:Responsable, K:Estado, L:FechaCierre, M:QuienCerro, N:FeedbackIA, O:EmailEnviado, P:RecomendacionID
export async function getSeguimientoData() {
  const data = await getSheetData('SEGUIMIENTO!A2:P');
  return data.map((row, idx) => ({
    id: row[0] || `seg-${idx}`,
    fechaRegistro: row[1] || '',
    colaborador: row[2] || '',
    area: row[3] || '',
    nivel: row[4] || '',
    metrica: row[5] || '',
    notas: row[6] || '',
    acuerdos: row[7] || '',
    fechaCompromiso: row[8] || '',
    responsable: row[9] || '',
    estado: row[10] || 'PENDIENTE',
    fechaCierre: row[11] || '',
    quienCerro: row[12] || '',
    feedbackIA: row[13] || '',
    emailEnviado: row[14] || 'NO',
    recomendacionId: row[15] || '',
  }));
}

export async function guardarSeguimiento(datos) {
  const id = `seg-${Date.now()}`;
  const ahora = new Date().toISOString().split('T')[0];
  const fila = [
    id,
    ahora,
    datos.colaborador || '',
    datos.area || '',
    datos.nivel || '',
    datos.metrica || '',
    datos.notas || '',
    datos.acuerdos || '',
    datos.fechaCompromiso || '',
    datos.responsable || '',
    'PENDIENTE',
    '',
    '',
    datos.feedbackIA || '',
    'NO',
    datos.recomendacionId || '',
  ];
  const ok = await appendSheetRow('SEGUIMIENTO!A:P', fila);
  return ok ? id : null;
}

export async function cerrarSeguimiento(id, quienCerro) {
  const data = await getSheetData('SEGUIMIENTO!A:A');
  const filaIdx = data.findIndex(row => row[0] === id);
  if (filaIdx === -1) return false;
  const filaNum = filaIdx + 2;
  const ahora = new Date().toISOString().split('T')[0];
  await updateSheetRow(`SEGUIMIENTO!K${filaNum}:M${filaNum}`, ['COMPLETADO', ahora, quienCerro]);
  return true;
}

export async function actualizarEmailEnviado(id) {
  const data = await getSheetData('SEGUIMIENTO!A:A');
  const filaIdx = data.findIndex(row => row[0] === id);
  if (filaIdx === -1) return false;
  const filaNum = filaIdx + 2;
  await updateSheetRow(`SEGUIMIENTO!O${filaNum}`, ['SI']);
  return true;
}
