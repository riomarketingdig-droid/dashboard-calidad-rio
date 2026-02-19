import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Gemini con tu API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { agente, metrica, valor, tendencia, nivel, area } = req.body;

    // Obtener el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construir el prompt contextual
    const prompt = `
      Eres un coach comercial experto en call centers. Genera un feedback de 2 frases para el agente:
      
      Agente: ${agente}
      Área de mejora: ${area}
      Métrica problemática: ${metrica} (valor actual: ${valor})
      Nivel de alerta: ${nivel}
      Tendencia: ${tendencia === 'up' ? 'mejorando' : tendencia === 'down' ? 'empeorando' : 'estable'}
      
      Reglas:
      - Sé específico y accionable
      - Menciona la métrica exacta
      - Da una sugerencia concreta para el ritual diario
      - Tono profesional pero motivador
      - Máximo 2 frases
      
      Ejemplo de respuesta: "Tu conversión del 42% está por debajo del objetivo del 50%. En la sesión de hoy practiquemos el manejo de objeciones de precio para mejorar tu cierre."
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    res.status(200).json({ 
      feedback,
      sugerencia: feedback
    });
  } catch (error) {
    console.error('Error generando feedback:', error);
    res.status(500).json({ error: 'Error al generar feedback con IA' });
  }
}
