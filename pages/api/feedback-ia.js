import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verificar que la API key existe
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY no está configurada en las variables de entorno');
    return res.status(500).json({ 
      error: 'API Key no configurada. Configura GEMINI_API_KEY en Vercel.' 
    });
  }

  try {
    const { agente, metrica, valor, tendencia, nivel, area } = req.body;

    if (!agente || !metrica || !nivel || !area) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Modelo actualizado: gemini-2.0-flash (reemplaza a 1.5-flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

    // Mensajes de error más descriptivos según el tipo
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return res.status(401).json({ error: 'API Key de Gemini inválida. Verifica tu clave en Vercel.' });
    }
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ error: 'Cuota de Gemini agotada. Intenta más tarde.' });
    }
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return res.status(500).json({ error: 'Modelo de IA no encontrado. Contacta al administrador.' });
    }

    res.status(500).json({ error: 'Error al generar feedback con IA' });
  }
}
