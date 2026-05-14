// src/services/healthDataService.js
// HealthSync data service — Supabase-backed with demo simulation fallback
// Supports Temperature, Oxygen (SpO2), and Humidity sensors

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ────────────────────────────────────────────────────────────────
// Demo simulation helpers (used when Supabase is not configured)
// ────────────────────────────────────────────────────────────────

function generateSimulatedReading(index = 0) {
  // Temperature: 35.5 – 38.5 °C (occasionally elevated)
  const temp = parseFloat((Math.random() * 3 + 35.5).toFixed(1));
  // Oxygen: 93 – 100 %
  const oxygen = Math.round(Math.random() * 7 + 93);
  // Humidity: 30 – 80 %
  const humidity = Math.round(Math.random() * 50 + 30);

  let status = 'normal';
  if (temp > 37.5 || oxygen < 95 || humidity > 70 || humidity < 30) status = 'warning';
  if (temp > 38.5 || oxygen < 90) status = 'critical';

  return {
    t: index,
    temp,
    o2: oxygen,
    humidity,
    status,
    timestamp: new Date(Date.now() - (30 - index) * 5000).toISOString(),
  };
}

function generateHistoricalSimulation(count = 30) {
  return Array.from({ length: count }, (_, i) => generateSimulatedReading(i));
}

// ────────────────────────────────────────────────────────────────
// Supabase helpers
// ────────────────────────────────────────────────────────────────

async function fetchFromSupabase(limit = 30) {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('id, temperature, oxygen, humidity, status, timestamp')
    .order('timestamp', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data.map((row, i) => ({
    t: i,
    temp: row.temperature,
    o2: row.oxygen,
    humidity: row.humidity,
    status: row.status || 'normal',
    timestamp: row.timestamp,
    id: row.id,
  }));
}

async function insertToSupabase(reading) {
  const { data, error } = await supabase
    .from('sensor_data')
    .insert([{
      temperature: reading.temp,
      oxygen: reading.o2,
      humidity: reading.humidity,
      status: reading.status,
      timestamp: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function fetchAlertsFromSupabase() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

async function insertAlertToSupabase(alert) {
  const { error } = await supabase.from('alerts').insert([{
    alert_message: alert.message,
    sensor_type: alert.sensor_type,
    severity: alert.severity,
    timestamp: new Date().toISOString(),
  }]);
  if (error) console.warn('Failed to insert alert:', error.message);
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

const healthDataService = {
  /**
   * Get sensor readings for the dashboard.
   * Returns chart-ready array: [{ t, temp, o2, humidity, status, timestamp }]
   */
  async getSensorData(limit = 30) {
    if (!isSupabaseConfigured) {
      return { success: true, data: generateHistoricalSimulation(limit) };
    }
    try {
      const data = await fetchFromSupabase(limit);
      // Fall back to simulation if table is empty
      const result = data.length > 0 ? data : generateHistoricalSimulation(limit);
      return { success: true, data: result };
    } catch (err) {
      console.warn('Supabase fetch failed, using simulation:', err.message);
      return { success: true, data: generateHistoricalSimulation(limit) };
    }
  },

  /**
   * Generate and store a new simulated sensor reading.
   * In demo mode, just returns the reading without persisting.
   */
  async addSensorReading(existingPoints = []) {
    const index = existingPoints.length;
    const reading = generateSimulatedReading(index);

    if (isSupabaseConfigured) {
      try {
        await insertToSupabase(reading);
        // Also insert alert if status is warning/critical
        if (reading.status !== 'normal') {
          const alerts = buildAlerts(reading);
          for (const a of alerts) {
            await insertAlertToSupabase(a);
          }
        }
      } catch (err) {
        console.warn('Failed to persist reading to Supabase:', err.message);
      }
    }
    return reading;
  },

  /**
   * Get recent alerts (Supabase or generated from local data).
   */
  async getAlerts(points = []) {
    if (isSupabaseConfigured) {
      try {
        const alerts = await fetchAlertsFromSupabase();
        return { success: true, data: alerts };
      } catch (err) {
        console.warn('Failed to fetch alerts:', err.message);
      }
    }
    // Build alerts from latest reading in demo mode
    const latest = points[points.length - 1];
    const alerts = latest ? buildAlerts(latest).map((a, i) => ({ ...a, id: i })) : [];
    return { success: true, data: alerts };
  },

  /**
   * Subscribe to real-time Supabase sensor_data inserts.
   * Callback receives a new chart-ready data point.
   */
  subscribeToSensorData(callback) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('sensor-data-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => {
          const row = payload.new;
          callback({
            t: Date.now(),
            temp: row.temperature,
            o2: row.oxygen,
            humidity: row.humidity,
            status: row.status || 'normal',
            timestamp: row.timestamp,
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────

function buildAlerts(reading) {
  const alerts = [];
  if (reading.temp > 38.5) {
    alerts.push({ message: `High temperature detected: ${reading.temp}°C`, sensor_type: 'temperature', severity: 'critical' });
  } else if (reading.temp > 37.5) {
    alerts.push({ message: `Elevated temperature: ${reading.temp}°C`, sensor_type: 'temperature', severity: 'warning' });
  }
  if (reading.o2 < 90) {
    alerts.push({ message: `Critically low SpO₂: ${reading.o2}%`, sensor_type: 'oxygen', severity: 'critical' });
  } else if (reading.o2 < 95) {
    alerts.push({ message: `Low oxygen saturation: ${reading.o2}%`, sensor_type: 'oxygen', severity: 'warning' });
  }
  if (reading.humidity > 70) {
    alerts.push({ message: `High humidity: ${reading.humidity}%`, sensor_type: 'humidity', severity: 'warning' });
  } else if (reading.humidity < 30) {
    alerts.push({ message: `Low humidity: ${reading.humidity}%`, sensor_type: 'humidity', severity: 'warning' });
  }
  return alerts;
}

export default healthDataService;