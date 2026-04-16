import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `Eres el asistente inteligente de TodoMueble Guardamar, un sistema de gestión para tiendas de muebles y electrodomésticos.

Tu nombre es "Agente TodoMueble". Hablas siempre en español de España.

CONTEXTO DEL NEGOCIO:
- Gestionas tiendas que venden electrodomésticos (lavadoras, frigoríficos, hornos, lavavajillas, etc.) y muebles
- El sistema controla: pedidos a proveedor, recepción de mercancía, incidencias, entregas a cliente, vehículos
- Los proveedores principales son fabricantes y distribuidores de electrodomésticos
- Las incidencias más comunes: mercancía que falta, productos dañados en transporte, diferencias de cantidad

ROLES:
- JEFE: dueño/gerente, ve todo, decide todo
- ALMACEN: recepción y chequeo de mercancía
- REPARTO: entregas al cliente con furgoneta

TU FUNCIÓN:
- Responder preguntas sobre el estado del negocio
- Dar recomendaciones basadas en los datos
- Ayudar a interpretar incidencias y sugerir acciones
- Resumir la situación cuando te lo pidan
- Ser directo, útil y conciso

REGLAS:
- Respuestas cortas (max 3-4 frases)
- Siempre en español
- Usa datos concretos cuando los tengas
- Si no tienes datos suficientes, dilo claramente
- No inventes información`;

export async function chat(userMessage: string, context: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nDATOS ACTUALES DEL NEGOCIO:\n${context}\n\nPREGUNTA DEL USUARIO:\n${userMessage}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    return result.response.text();
  } catch (e) {
    console.error("[gemini] error:", e);
    return "Lo siento, no he podido procesar tu pregunta. Inténtalo de nuevo.";
  }
}

export async function generateBriefing(context: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nGenera un BRIEFING MATUTINO para el jefe de la tienda. Máximo 5 frases. Estilo directo, como un informe rápido. Incluye qué necesita atención urgente y qué está bien.\n\nDATOS ACTUALES:\n${context}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.5,
      },
    });

    return result.response.text();
  } catch (e) {
    console.error("[gemini] briefing error:", e);
    return "No se pudo generar el briefing. Revisa las incidencias manualmente.";
  }
}

export async function detectAnomalies(context: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nAnaliza los datos del negocio y detecta ANOMALÍAS o situaciones que requieran atención. Devuelve un JSON array de strings con las alertas detectadas. Si todo está bien, devuelve un array vacío []. SOLO responde con el JSON array, nada más.\n\nDATOS:\n${context}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.3,
      },
    });

    const text = result.response.text().trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  } catch (e) {
    console.error("[gemini] anomalies error:", e);
    return [];
  }
}
