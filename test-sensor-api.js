// test-sensor-api.js
// Quick test script to simulate what your ESP32 will send.
// Usage:
//   1. Local Vercel dev:  node test-sensor-api.js http://localhost:3000/api/sensor-data
//   2. Deployed Vercel:   node test-sensor-api.js https://your-app.vercel.app/api/sensor-data
//   3. Direct Supabase:   node test-sensor-api.js  (no args — tests Supabase directly)

const url = process.argv[2]; // optional: pass the API URL as argument

const sensorPayload = {
  temperature: 36.8,
  oxygen: 98,
  humidity: 55,
};

async function testViaAPI(apiUrl) {
  console.log(`\n🚀 Sending POST to: ${apiUrl}`);
  console.log(`📦 Payload:`, JSON.stringify(sensorPayload, null, 2));

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sensorPayload),
  });

  const body = await res.json();
  console.log(`📡 Status: ${res.status}`);
  console.log(`📋 Response:`, JSON.stringify(body, null, 2));

  if (res.status === 201) {
    console.log('\n✅ SUCCESS — Data saved! Check your Dashboard.');
  } else {
    console.log('\n❌ FAILED — See response above for details.');
  }
}

async function testDirectSupabase() {
  // Load from .env file manually
  const fs = await import('fs');
  const envContent = fs.readFileSync('.env', 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
  });

  const supabaseUrl = envVars['VITE_SUPABASE_URL'];
  const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    return;
  }

  const insertUrl = `${supabaseUrl}/rest/v1/sensor_data`;
  console.log(`\n🚀 Testing DIRECT Supabase insert: ${insertUrl}`);
  console.log(`📦 Payload:`, JSON.stringify(sensorPayload, null, 2));

  const res = await fetch(insertUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      ...sensorPayload,
      status: 'normal',
      timestamp: new Date().toISOString(),
    }),
  });

  const body = await res.text();
  console.log(`📡 Status: ${res.status}`);
  console.log(`📋 Response:`, body);

  if (res.status === 201) {
    console.log('\n✅ SUCCESS — Supabase insert works! Your API endpoint will work too.');
    console.log('🖥️  Open your Dashboard — new data should appear via real-time subscription.');
  } else {
    console.log('\n❌ FAILED — Check your RLS policy and env vars.');
  }
}

// Run
if (url) {
  testViaAPI(url);
} else {
  console.log('No URL provided — testing direct Supabase insert...');
  testDirectSupabase();
}
