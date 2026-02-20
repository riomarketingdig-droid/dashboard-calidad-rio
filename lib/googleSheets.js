import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Auth con permisos de lectura Y escritura
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ─── LECTURA GENÉRICA ────────────────────────────────────────────────────────
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

// ─── ESCRITURA GENÉRICA ──────────────────────────────────────────────────────
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

// ─── DATOS GERENCIAL ─────────────────────────────────────────────────────────
export async function getGerencialData() {
  const data = await getSheetData('GERENCIAL_DATOS!A2:J');
  return data.map(row => ({
    fecha: row[0],
    ano: parseInt(row[1]),
    año: parseInt(row[1]),
    semana: parseInt(row[2]),
    mes: row[3],
    trimestre: row[4],
    indicador: row[5],
    proceso: row[6],
    valor: parseFloat(row[7]) || row[7],
    meta: row[8],
    responsable: row[9]
  }));
}

// ─── DATOS COORDINACIÓN ──────────────────────────────────────────────────────
export async function getCoordinacionData() {
  const data = await getSheetData('COORDINACION_DETALLE!A2:N');
  return data.map(row => ({
    fecha: row[0],
    colaborador: row[1],
    unidad: row[2],
    efectividadSIO: parseFloat(row[3]),
    tiempoPromedio: parseFloat(row[4]),
    cantidadRegistros: parseInt(row[5]),
    noConformidades: parseInt(row[6]),
    sncLab: parseInt(row[7]),
    efectividadHallazgos: parseFloat(row[8]),
    semaforo: row[9],
    reincidencias: parseInt(row[10]),
    ultimaAccion: row[11],
    proximoSeguimiento: row[12]
  }));
}

// ─── DATOS AGENDAMIENTO ──────────────────────────────────────────────────────
export async function getAgendamientoData() {
  const data = await getSheetData('AGENDAMIENTO_DETALLE!A2:O');
  return data.map(row => ({
    fecha: row[0],
    asesor: row[1],
    oportunidades: parseInt(row[2]),
    cierres: parseInt(row[3]),
    conversion: parseFloat(row[4]),
    noConformidades: parseInt(row[5]),
    snc: parseInt(row[6]),
    hallazgosCitas: parseInt(row[7]),
    hallazgosCotizacion: parseInt(row[8]),
    hallazgosAgendas: parseInt(row[9]),
    reincidencias: parseInt(row[10]),
    estatus: row[11],
    semaforo: row[12],
    ultimaAuditoria: row[13],
    proximaRevision: row[14]
  }));
}

// ─── COLABORADORES ────────────────────────────────────────────────────────────
// Pestaña: COLABORADORES con columnas:
// A: Nombre | B: Area | C: Unidad | D: Puesto | E: JefeInmediato
// F: EmailColaborador | G: EmailJefe | H: FechaIngreso | I: Activo
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

// ─── SEGUIMIENTO ──────────────────────────────────────────────────────────────
// Pestaña: SEGUIMIENTO con columnas:
// A: ID | B: FechaRegistro | C: Colaborador | D: Area | E: Nivel
// F: Metrica | G: Notas | H: Acuerdos | I: FechaCompromiso
// J: Responsable | K: Estado | L: FechaCierre | M: QuienCerro
// N: FeedbackIA | O: EmailEnviado | P: RecomendacionID
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
  // Buscar la fila con ese ID
  const data = await getSheetData('SEGUIMIENTO!A:A');
  const filaIdx = data.findIndex(row => row[0] === id);
  if (filaIdx === -1) return false;

  const filaNum = filaIdx + 2; // +1 por header, +1 por base 1
  const ahora = new Date().toISOString().split('T')[0];

  await updateSheetRow(`SEGUIMIENTO!K${filaNum}:M${filaNum}`, [
    'COMPLETADO', ahora, quienCerro
  ]);
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
