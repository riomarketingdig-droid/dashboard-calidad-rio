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

    const prompt = `Eres un coach comercial experto en call centers. Genera un feedback de 2 frases para el agente. Agente: ${agente}. Area: ${area}. Metrica: ${metrica} (valor: ${valor}). Nivel: ${nivel}. Tendencia: ${tendenciaTexto}. Maximo 2 frases, tono motivador y especifico.`;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    res.status(200).json({ feedback, sugerencia: feedback });

  } catch (error) {
    console.error("Error generando feedback:", error.message);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
}
