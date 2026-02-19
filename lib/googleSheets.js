import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

export async function getGerencialData() {
  const data = await getSheetData('GERENCIAL_DATOS!A2:J');
  return data.map(row => ({
    fecha: row[0],
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
