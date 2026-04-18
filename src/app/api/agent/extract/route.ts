import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const EXTRACT_PROMPT = `Eres un experto en contabilidad y logistica de tiendas de electrodomesticos en España.

Analiza el documento proporcionado (puede ser una factura PDF, un albaran, una foto de producto dañado, o cualquier documento de negocio).

Si es una FACTURA o ALBARAN, extrae:
- invoiceNumber: numero de factura/albaran
- issuerName: nombre del proveedor
- issuerNif: NIF/CIF del proveedor
- concept: concepto o descripcion
- amount: importe base (numero decimal)
- tax: importe IVA (numero decimal)
- totalAmount: total con IVA
- invoiceDate: fecha (YYYY-MM-DD)
- dueDate: fecha vencimiento si la hay
- items: array de productos [{name, quantity, unitPrice}]

Si es una FOTO DE PRODUCTO DAÑADO:
- damageType: tipo de daño (golpe, arañazo, rotura, etc.)
- damageDescription: descripcion del daño
- productIdentified: producto identificado si es posible
- severity: leve, moderado, grave
- recommendation: recomendacion (reclamar, devolver, descontar, etc.)

Si es OTRO DOCUMENTO:
- documentType: tipo de documento
- summary: resumen del contenido
- keyData: datos clave extraidos

Responde SOLO con JSON valido.`;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { dataUrl, fileName } = body;

    if (!dataUrl) return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });

    // Extract base64 and mime type
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return NextResponse.json({ error: "Formato de archivo no válido" }, { status: 400 });

    const mimeType = match[1];
    const base64Data = match[2];

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: `${EXTRACT_PROMPT}\n\nArchivo: ${fileName || "documento"}` },
          { inlineData: { mimeType, data: base64Data } },
        ],
      }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.2 },
    });

    const text = result.response.text().trim();
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, data: extracted, raw: text });
    }

    return NextResponse.json({ success: true, data: null, raw: text });
  } catch (e) {
    console.error("[extract] error:", e);
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}
