import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("VITE_GEMINI_API_KEY is missing. AI features will not work.");
}

export const aiService = {
  isConfigured: !!apiKey,
  
  async getHealthInsights(sensorData) {
    if (!genAI) throw new Error("Gemini API key not configured");
    if (!sensorData || sensorData.length === 0) return null;
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            healthStatus: {
              type: SchemaType.STRING,
              description: "Overall health status (Normal, Warning, Critical)"
            },
            summary: {
              type: SchemaType.STRING,
              description: "A short, 1-2 sentence AI-generated summary of the patient's current condition based on the readings."
            },
            insights: {
              type: SchemaType.ARRAY,
              description: "Array of specific health insights.",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  type: { type: SchemaType.STRING, description: "'critical', 'warning', or 'normal'" },
                  sensor: { type: SchemaType.STRING, description: "Which sensor this insight applies to: 'Temperature', 'Oxygen', 'Humidity'" },
                  text: { type: SchemaType.STRING, description: "The insight message text. Keep it short and actionable." }
                },
                required: ["type", "sensor", "text"]
              }
            },
            alerts: {
              type: SchemaType.ARRAY,
              description: "Array of emergency alerts if critical thresholds are crossed. Can be empty if normal.",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  severity: { type: SchemaType.STRING, description: "'critical' or 'warning'" },
                  msg: { type: SchemaType.STRING, description: "The alert message." },
                  sensor: { type: SchemaType.STRING, description: "Which sensor triggered the alert." }
                },
                required: ["severity", "msg", "sensor"]
              }
            }
          },
          required: ["healthStatus", "summary", "insights", "alerts"]
        }
      }
    });

    const recentReadings = sensorData.slice(-5); // Use last 5 readings for context
    const prompt = `You are a medical AI assistant analyzing IoT health monitoring data.
Analyze the following recent sensor readings:
${JSON.stringify(recentReadings, null, 2)}

Thresholds:
- Temperature: Normal 36-37.5°C, Fever > 38°C
- Oxygen (SpO2): Normal 95-100%, Low < 95%, Critical < 92%
- Humidity: Normal 30-70%

Generate health insights, a summary, and any necessary alerts based on this data. Do not diagnose or prescribe medicine, just provide monitoring awareness.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (err) {
      console.error("AI Insight Generation Error:", err);
      throw err;
    }
  },

  async startChat(history, currentReadings) {
    if (!genAI) throw new Error("Gemini API key not configured");
    
    const systemInstruction = `You are the HealthSync AI Assistant for patients using an IoT health monitoring system.
The system monitors three sensors: Body Temperature (DS18B20), Oxygen Saturation/SpO2 (Pulse Oximeter), and Humidity (DHT22).
Keep answers clear and concise (2-4 sentences), using simple non-technical language.
If the user just greets you, reply with a friendly greeting and a health tip.
Normal healthy ranges: Temperature 36-37.5°C, SpO2 95-100%, Humidity 30-70%.
You may explain sensor readings, alerts, and how to use the HealthSync dashboard, but do not give medical diagnoses or prescribe treatment.
If the user describes severe symptoms like trouble breathing or very high fever, tell them to seek immediate emergency medical care.

CURRENT REAL-TIME SENSOR READINGS FOR CONTEXT:
${JSON.stringify(currentReadings || {}, null, 2)}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });
    
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    return model.startChat({
      history: formattedHistory
    });
  }
};
