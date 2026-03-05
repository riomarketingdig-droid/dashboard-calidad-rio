// Envío de correo vía Microsoft Graph API
// Requiere variables de entorno:
// MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_SENDER_EMAIL

async function getMSToken() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Faltan variables de entorno de Microsoft: MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET');
  }

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error obteniendo token MS: ${err}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function enviarCorreoGraph({ token, senderEmail, destinatarios, asunto, cuerpoHTML }) {
  const toRecipients = destinatarios.map(email => ({
    emailAddress: { address: email }
  }));

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: asunto,
          body: { contentType: 'HTML', content: cuerpoHTML },
          toRecipients,
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!response.ok && response.status !== 202) {
    const err = await response.text();
    throw new Error(`Error enviando correo: ${err}`);
  }

  return true;
}

function generarCuerpoHTML({ colaborador, area, nivel, metrica, notas, acuerdos, fechaCompromiso, responsable, feedbackIA, fecha }) {
  const coloresNivel = {
    URGENTE: '#dc2626',
    CRITICO: '#ea580c',
    ALTO: '#d97706',
    VERDE: '#16a34a',
  };
  const color = coloresNivel[nivel] || '#64748b';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #0066CC; padding: 24px 32px; }
    .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 12px; }
    .nivel-badge { display: inline-block; background: ${color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; }
    .body { padding: 32px; }
    .colaborador { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .metrica { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .section { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 3px solid ${color}; }
    .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px; }
    .section-content { font-size: 14px; color: #334155; line-height: 1.6; }
    .ai-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .ai-box .section-title { color: #3b82f6; }
    .ai-box .section-content { font-style: italic; color: #1e40af; }
    .fecha-box { display: flex; justify-content: space-between; background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; }
    .fecha-item { text-align: center; }
    .fecha-item .label { font-size: 10px; text-transform: uppercase; color: #92400e; font-weight: 700; }
    .fecha-item .value { font-size: 14px; font-weight: 800; color: #78350f; }
    .footer { background: #f1f5f9; padding: 16px 32px; text-align: center; }
    .footer p { font-size: 11px; color: #94a3b8; margin: 0; }
    .firma { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tablero de Control · Grupo RIO</h1>
      <p>Retroalimentación formal de desempeño · ${fecha}</p>
    </div>
    <div class="body">
      <div class="nivel-badge">${nivel}</div>
      <div class="colaborador">${colaborador}</div>
      <div class="metrica">Área: ${area} &nbsp;·&nbsp; Métrica: ${metrica}</div>

      ${notas ? `
      <div class="section">
        <div class="section-title">📋 Notas de la sesión</div>
        <div class="section-content">${notas}</div>
      </div>` : ''}

      ${acuerdos ? `
      <div class="section">
        <div class="section-title">🤝 Acuerdos establecidos</div>
        <div class="section-content">${acuerdos}</div>
      </div>` : ''}

      ${feedbackIA ? `
      <div class="ai-box">
        <div class="section-title">🤖 Feedback generado por IA</div>
        <div class="section-content">"${feedbackIA}"</div>
      </div>` : ''}

      <div class="fecha-box">
        <div class="fecha-item">
          <div class="label">Fecha de sesión</div>
          <div class="value">${fecha}</div>
        </div>
        <div class="fecha-item">
          <div class="label">Fecha compromiso</div>
          <div class="value">${fechaCompromiso || 'Por definir'}</div>
        </div>
        <div class="fecha-item">
          <div class="label">Responsable</div>
          <div class="value">${responsable || 'Coordinador'}</div>
        </div>
      </div>

      <div class="firma">
        <strong>Este correo es constancia formal</strong> de la retroalimentación recibida y los acuerdos establecidos.
        Si tienes dudas o comentarios sobre esta retroalimentación, comunícate con tu coordinador directo.<br><br>
        <em>Grupo RIO · Sistema de Gestión de Calidad</em>
      </div>
    </div>
    <div class="footer">
      <p>Este mensaje fue generado automáticamente por el Tablero de Control de Calidad · Grupo RIO</p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      colaborador, area, nivel, metrica,
      notas, acuerdos, fechaCompromiso,
      responsable, feedbackIA,
      emailColaborador, emailJefe,
      seguimientoId
    } = req.body;

    if (!emailColaborador) {
      return res.status(400).json({
        error: 'No hay email del colaborador. Agrégalo en la pestaña COLABORADORES del Google Sheets.'
      });
    }

    const senderEmail = process.env.MS_SENDER_EMAIL;
    if (!senderEmail) {
      return res.status(500).json({ error: 'Falta variable MS_SENDER_EMAIL en Vercel' });
    }

    const fecha = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const cuerpoHTML = generarCuerpoHTML({
      colaborador, area, nivel, metrica,
      notas, acuerdos, fechaCompromiso,
      responsable, feedbackIA, fecha
    });

    const destinatarios = [emailColaborador];
    if (emailJefe) destinatarios.push(emailJefe);

    // Si no hay credenciales de MS configuradas, simular éxito para desarrollo
    if (!process.env.MS_TENANT_ID) {
      console.log('[MODO DEV] Correo no enviado - faltan credenciales MS Graph');
      console.log('Destinatarios:', destinatarios);
      return res.status(200).json({
        mensaje: 'Correo simulado (configurar MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET en Vercel)',
        destinatarios,
        modoDesarrollo: true
      });
    }

    const token = await getMSToken();
    await enviarCorreoGraph({
      token,
      senderEmail,
      destinatarios,
      asunto: `[Grupo RIO] Retroalimentación de desempeño · ${colaborador}`,
      cuerpoHTML
    });

    // Marcar como enviado en Sheets si hay ID de seguimiento
    if (seguimientoId) {
      const { actualizarEmailEnviado } = await import('../../lib/googleSheets');
      await actualizarEmailEnviado(seguimientoId);
    }

    return res.status(200).json({
      mensaje: `Correo enviado correctamente a: ${destinatarios.join(', ')}`,
      destinatarios
    });

  } catch (error) {
    console.error('Error enviando feedback:', error);
    return res.status(500).json({ error: error.message });
  }
}
