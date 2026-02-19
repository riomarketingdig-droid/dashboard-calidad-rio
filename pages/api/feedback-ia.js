import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key no configurada." });
  }

  try {
    const { agente, metrica, valor, tendencia, nivel, area } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const tendenciaTexto = tendencia === "up" ? "mejorando" : tendencia === "down" ? "empeorando" : "estable";

    const tonoMap = {
      "URGENTE": "URGENTE: Sé directo y firme. Indica claramente que la situacion requiere correccion inmediata. NO felicites. Exige accion concreta hoy.",
      "CRITICO": "CRITICO: Sé serio y enfocado en la correccion. Indica el problema sin rodeos y da un paso de accion inmediato.",
      "ALTO": "ALTO: Tono profesional y motivador. Señala el area de mejora y sugiere una accion especifica esta semana.",
      "VERDE": "VERDE: Felicita el buen desempeño y motiva a mantenerlo o compartirlo con el equipo."
    };

    const tono = tonoMap[nivel] || "Tono profesional y directo.";

    const prompt = `Eres un coach comercial experto en call centers. Genera exactamente 2 frases de feedback para este agente.

Agente: ${agente}
Area: ${area}
Metrica: ${metrica} (valor actual: ${valor})
Nivel de alerta: ${nivel}
Tendencia: ${tendenciaTexto}

Instruccion de tono: ${tono}

Responde SOLO con las 2 frases, sin introduccion, sin comillas, sin explicaciones adicionales.`;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    res.status(200).json({ feedback, sugerencia: feedback });

  } catch (error) {
    console.error("Error generando feedback:", error.message);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
}
