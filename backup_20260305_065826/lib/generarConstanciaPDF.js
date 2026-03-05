// lib/generarConstanciaPDF.js
// Genera constancia de retroalimentación en el browser con jsPDF
// No requiere servidor ni credenciales

export async function generarConstanciaPDF({
  colaborador,
  area,
  nivel,
  metrica,
  notas,
  acuerdos,
  fechaCompromiso,
  responsable,
  feedbackIA,
  unidad,
  puesto,
}) {
  // Importar jsPDF dinámicamente (solo en browser)
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // ancho A4
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const coloresNivel = {
    URGENTE: [220, 38, 38],
    CRITICO: [234, 88, 12],
    ALTO: [217, 119, 6],
    VERDE: [22, 163, 74],
  };
  const colorNivel = coloresNivel[nivel] || [100, 116, 139];

  // ─── ENCABEZADO ───────────────────────────────────────────────────────────
  // Barra azul superior
  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, W, 28, 'F');

  // Línea de acento del color del nivel
  doc.setFillColor(...colorNivel);
  doc.rect(0, 28, W, 3, 'F');

  // Título en el header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GRUPO RIO · CONSTANCIA DE RETROALIMENTACIÓN', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sistema de Gestión de Calidad · Confidencial', margin, 19);

  const fecha = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.text(fecha, W - margin, 19, { align: 'right' });

  y = 40;

  // ─── BADGE DE NIVEL ────────────────────────────────────────────────────────
  doc.setFillColor(...colorNivel);
  doc.roundedRect(margin, y, 38, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`● ${nivel}`, margin + 4, y + 5.2);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(area, margin + 44, y + 5.2);

  y += 14;

  // ─── DATOS DEL COLABORADOR ─────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, 26, 2, 2, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('COLABORADOR', margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(colaborador || 'Sin nombre', margin + 4, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const detalles = [puesto, unidad, area].filter(Boolean).join('  ·  ');
  if (detalles) doc.text(detalles, margin + 4, y + 21);

  // Métrica en el lado derecho
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('MÉTRICA EVALUADA', W - margin - 60, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const metricaLines = doc.splitTextToSize(metrica || '', 58);
  doc.text(metricaLines, W - margin - 60, y + 13);

  y += 32;

  // ─── LÍNEA DIVISORA ────────────────────────────────────────────────────────
  const drawSection = (titulo, contenido, yPos, bgColor = [255, 255, 255], borderColor = [226, 232, 240]) => {
    if (!contenido) return yPos;

    const lines = doc.splitTextToSize(contenido, contentW - 10);
    const boxH = 10 + lines.length * 5.5;

    doc.setFillColor(...bgColor);
    doc.roundedRect(margin, yPos, contentW, boxH, 2, 2, 'F');
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentW, boxH, 2, 2, 'S');

    // Línea de acento izquierda
    doc.setFillColor(...borderColor);
    doc.rect(margin, yPos, 3, boxH, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(titulo.toUpperCase(), margin + 7, yPos + 6);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(lines, margin + 7, yPos + 12);

    return yPos + boxH + 5;
  };

  y = drawSection('📋 Notas de la sesión', notas, y, [248, 250, 252], [148, 163, 184]);
  y = drawSection('🤝 Acuerdos establecidos', acuerdos, y, [240, 249, 255], [59, 130, 246]);
  y = drawSection('🤖 Feedback generado por IA', feedbackIA ? `"${feedbackIA}"` : null, y, [239, 246, 255], [99, 102, 241]);

  // ─── FECHA COMPROMISO ──────────────────────────────────────────────────────
  if (fechaCompromiso || responsable) {
    doc.setFillColor(254, 252, 232);
    doc.roundedRect(margin, y, contentW, 16, 2, 2, 'F');
    doc.setDrawColor(253, 224, 71);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 16, 2, 2, 'S');

    const col1 = margin + 4;
    const col2 = margin + contentW / 3 + 4;
    const col3 = margin + (contentW * 2) / 3 + 4;

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('FECHA DE SESIÓN', col1, y + 6);
    doc.text('FECHA COMPROMISO', col2, y + 6);
    doc.text('RESPONSABLE', col3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15);
    doc.text(new Date().toLocaleDateString('es-MX'), col1, y + 13);
    doc.text(fechaCompromiso || 'Por definir', col2, y + 13);
    doc.text(responsable || 'Coordinador', col3, y + 13);

    y += 21;
  }

  // ─── SECCIÓN DE FIRMAS ─────────────────────────────────────────────────────
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 48, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, 48, 2, 2, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FIRMAS DE CONFORMIDAD', margin + contentW / 2, y + 7, { align: 'center' });

  const firmaW = (contentW - 20) / 2;
  const f1x = margin + 5;
  const f2x = margin + firmaW + 15;
  const firmaY = y + 35;

  // Líneas de firma
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(f1x, firmaY, f1x + firmaW, firmaY);
  doc.line(f2x, firmaY, f2x + firmaW, firmaY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(colaborador || 'Colaborador', f1x + firmaW / 2, firmaY + 6, { align: 'center' });
  doc.text(responsable || 'Coordinador / Gerente', f2x + firmaW / 2, firmaY + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Firma del colaborador · "He recibido esta retroalimentación"', f1x + firmaW / 2, firmaY + 11, { align: 'center' });
  doc.text('Firma del responsable · Grupo RIO', f2x + firmaW / 2, firmaY + 11, { align: 'center' });

  y += 55;

  // ─── PIE DE PÁGINA ─────────────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 280, W, 17, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'Este documento es constancia formal de retroalimentación · Grupo RIO · Sistema de Gestión de Calidad',
    W / 2, 287, { align: 'center' }
  );
  doc.text(
    `Generado el ${new Date().toLocaleString('es-MX')} · Tablero de Control de Calidad`,
    W / 2, 292, { align: 'center' }
  );

  // ─── DESCARGAR ─────────────────────────────────────────────────────────────
  const nombreArchivo = `Constancia_${(colaborador || 'colaborador').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
}
