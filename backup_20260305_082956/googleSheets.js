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

// ─── GERENCIAL ─────────────────────────────────────────────────
export async function getGerencialData() {
  const data = await getSheetData('GERENCIAL_DATOS!A2:K');
  return data.map(row => ({
    fecha: row[0],
    ano: parseInt(row[1]),
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

// ─── COORDINACIÓN (unificado con endpoint) ─────────────────────
export async function getCoordinacionData() {
  const data = await getSheetData('COORDINACION_DETALLE!A2:N'); // hasta columna N
  return data.map(row => ({
    fecha: row[0] || '',
    mes: row[1] || '',
    colaborador: row[2] || '',
    unidad: row[3] || '',
    ftr: row[4] ? parseFloat(row[4]) : 0,
    tiempoPromedio: row[5] ? parseFloat(row[5]) : 0,
    cantidadRegistros: row[6] ? parseInt(row[6]) : 0,
    noConformidades: row[7] ? parseInt(row[7]) : 0,
    snc: row[8] ? parseInt(row[8]) : 0,
    semaforo: row[9] || 'SIN DEFINIR',
    reincidencias: row[10] ? parseInt(row[10]) : 0,
    ultimaAccion: row[11] || '',
    proximoSeguimiento: row[12] || ''
  }));
}

// ─── AGENDAMIENTO (unificado con endpoint) ────────────────────
export async function getAgendamientoData() {
  const data = await getSheetData('AGENDAMIENTO_DETALLE!A2:O');
  return data.map(row => ({
    fecha: row[0] || '',
    mes: row[1] || '',
    semana: row[2] ? parseInt(row[2]) : 0,
    asesor: row[3] || '',
    citasAgendadas: row[4] ? parseInt(row[4]) : 0,
    oportunidadesAprovechadas: row[5] ? parseFloat(row[5]) : 0,
    hallazgosCotizacion: row[6] ? parseFloat(row[6]) : 0,
    hallazgosVenta: row[7] ? parseFloat(row[7]) : 0,
    efectividadHallazgos: row[8] ? parseFloat(row[8]) : 0,
    snc: row[9] ? parseInt(row[9]) : 0,
    noConformidades: row[10] ? parseInt(row[10]) : 0,
    efectividadAgendamiento: row[11] ? parseFloat(row[11]) : 0,
    estatus: row[12] || '',
    scoreTotal: row[13] ? parseFloat(row[13]) : 0,
    // opcionales si existen más columnas
    reincidencias: row[14] ? parseInt(row[14]) : 0,
    ultimaAuditoria: row[15] || '',
    proximaRevision: row[16] || ''
  }));
}

// ─── COLABORADORES ─────────────────────────────────────────────
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

// ─── SEGUIMIENTO ───────────────────────────────────────────────
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
