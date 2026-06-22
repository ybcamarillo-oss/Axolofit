// Modelo de Gemini a usar. Fácil de cambiar aquí arriba.
const MODEL = "gemini-2.0-flash";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(500).json({ error: "Key no configurada" }); return; }

  // DIAGNÓSTICO: lista los modelos disponibles para este proyecto.
  // Se activa enviando { "listModels": true } en el body.
  if (req.body && req.body.listModels === true) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );
      const data = await r.json();
      const modelos = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .map((m) => m.name);
      res.status(200).json({ modelos });
      return;
    } catch (e) {
      res.status(500).json({ error: "Error al listar modelos: " + e.message });
      return;
    }
  }

  const { prompt, image } = req.body;
  if (!prompt) { res.status(400).json({ error: "Falta el prompt" }); return; }

  // Construir las partes: texto + imagen opcional
  const parts = [{ text: prompt }];
  if (image) {
    // image debe venir como base64 puro (sin el prefijo data:image/...)
    parts.push({ inline_data: { mime_type: "image/jpeg", data: image } });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );
    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // DIAGNÓSTICO: si Gemini no devolvió texto, mostramos la respuesta cruda
    if (!text) {
      res.status(200).json({ text: "", debug: data, status: geminiRes.status });
      return;
    }

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Error al llamar a Gemini: " + e.message });
  }
}
