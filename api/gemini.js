export default async function handler(req, res) {
  // CORS para que el HTML de GitHub Pages pueda llamar a este proxy
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { prompt } = req.body;
  if (!prompt) { res.status(400).json({ error: "Falta el prompt" }); return; }

  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(500).json({ error: "Key no configurada" }); return; }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Error al llamar a Gemini: " + e.message });
  }
}
