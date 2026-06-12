const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  console.warn('VITE_GROQ_API_KEY is missing. OCR AI summary will not work.');
}

export const ocrAiService = {
  isConfigured: !!apiKey,

  async analyzeMedicalReport(ocrText) {
    if (!apiKey) throw new Error('Groq API key not configured.');
    if (!ocrText || ocrText.trim().length < 10) {
      throw new Error('Not enough text to analyze. Please upload a clearer document.');
    }

    const lang = localStorage.getItem('i18nextLng') || 'en';
    const prompt = `You are a helpful medical AI assistant. A user has uploaded a document and extracted its text via OCR. Analyze the text below and return a JSON object. Provide all JSON values entirely in the language corresponding to ISO code: ${lang}.

RULES:
- If the document is NOT a medical report (e.g. it's a resume, invoice, etc.), still return the JSON but note that in overallSummary and set documentType to the correct type.
- Do NOT diagnose or prescribe.
- Use plain, patient-friendly language.
- Keep each list item to one concise sentence.
- Return ONLY the JSON object, no markdown fences, no extra text.

REQUIRED JSON FORMAT:
{
  "documentType": "string (e.g. Blood Test Report, Prescription, Radiology Report, Resume, Unknown)",
  "overallSummary": "string (2-3 sentence summary of what the document contains)",
  "keyObservations": ["string", "string"],
  "importantValues": ["string", "string"],
  "possibleAbnormalities": ["string"],
  "disclaimer": "string (short note that this is AI-generated, not a medical diagnosis)"
}

EXTRACTED TEXT (first 3500 chars):
"""
${ocrText.substring(0, 3500)}
"""

Return only the JSON object:`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content.trim();

      // Strip markdown code fences if present
      responseText = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(responseText);

      // Ensure all expected keys exist with fallback defaults
      return {
        documentType:          parsed.documentType          || 'Unknown',
        overallSummary:        parsed.overallSummary        || 'Analysis complete.',
        keyObservations:       Array.isArray(parsed.keyObservations)       ? parsed.keyObservations       : [],
        importantValues:       Array.isArray(parsed.importantValues)       ? parsed.importantValues       : [],
        possibleAbnormalities: Array.isArray(parsed.possibleAbnormalities) ? parsed.possibleAbnormalities : [],
        disclaimer:            parsed.disclaimer || 'This is an AI-generated summary. It is not a medical diagnosis. Please consult a qualified healthcare professional.',
      };
    } catch (err) {
      console.error('OCR AI Analysis Error:', err);
      // Surface a meaningful error message
      if (err instanceof SyntaxError) {
        throw new Error('AI returned an unexpected response format. Please try again.');
      }
      if (err?.message?.includes('API key')) {
        throw new Error('Invalid Groq API key. Please check your .env configuration.');
      }
      throw new Error(err?.message || 'AI analysis failed. Please try again.');
    }
  },
};
