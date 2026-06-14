// api/sensor-data.js
// Vercel Serverless Function — receives sensor data from ESP32 via HTTP POST
// and inserts it into the Supabase `sensor_data` table.
//
// ESP32 sends:  POST /api/sensor-data
//               Content-Type: application/json
//               {"temperature":36.8, "oxygen":98, "humidity":55}

export default async function handler(req, res) {
  // ── CORS headers (allow ESP32 from any origin) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ── Read environment variables ──
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ── Validate payload ──
  const { temperature, oxygen, humidity } = req.body || {};

  if (temperature === undefined || oxygen === undefined || humidity === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: temperature, oxygen, humidity.',
    });
  }

  // ── Determine status based on sensor thresholds ──
  let status = 'normal';
  if (temperature > 37.5 || oxygen < 95 || humidity > 70 || humidity < 30) {
    status = 'warning';
  }
  if (temperature > 38.5 || oxygen < 90) {
    status = 'critical';
  }

  // ── Insert into Supabase sensor_data table via REST API ──
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sensor_data`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        temperature,
        oxygen,
        humidity,
        status,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Supabase insert failed:', response.status, errorBody);
      return res.status(502).json({
        error: 'Failed to save to database.',
        details: errorBody,
      });
    }

    const data = await response.json();

    return res.status(201).json({
      success: true,
      message: 'Sensor data saved!',
      data: data[0] || data,
    });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
