// Sample Database for HealthSync Dashboard Simulation
// Contains realistic patient data and historical readings

const sampleDatabase = {
  // Sample Patients
  patients: [
    {
      id: 1,
      first_name: "Aditya",
      last_name: "Wakalkar",
      age: 21,
      gender: "Male",
      condition: "Healthy Monitor"
    },
    {
      id: 2,
      first_name: "Vedant",
      last_name: "Bhavsar",
      age: 28,
      gender: "Male",
      condition: "Athlete Tracking"
    },
    
    {
      id: 3,
      first_name: "Atharva",
      last_name: "Dikondwar",
      age: 45,
      gender: "Male",
      condition: "Cardiac Monitoring"
    },
    {
      id: 4,
      first_name: "Steve",
      last_name: "Smith",
      age: 91,
      gender: "Male",
      condition: "Cardiac Monitoring"
    },
    {
      id: 5,
      first_name: "Emily",
      last_name: "Davis",
      age: 32,
      gender: "Female",
      condition: "Stress Management"
    }
  ],

  // Generate realistic historical data for each patient
  generateHistoricalData: function(patientId, hours = 24) {
    const data = [];
    const now = new Date();
    
    // Base values vary by patient condition
    const patientProfiles = {
      1: { hrBase: 72, hrVar: 8, tempBase: 36.8, o2Base: 98, stressBase: 'Low' },    // Healthy
      2: { hrBase: 65, hrVar: 12, tempBase: 36.6, o2Base: 99, stressBase: 'Low' },   // Athlete
      3: { hrBase: 85, hrVar: 15, tempBase: 37.0, o2Base: 96, stressBase: 'Medium' }, // Cardiac
      4: { hrBase: 78, hrVar: 10, tempBase: 36.9, o2Base: 97, stressBase: 'Medium' }  // Stress
    };
    
    const profile = patientProfiles[patientId] || patientProfiles[1];
    
    // Generate data points for specified hours (one reading per 5 minutes)
    const readingsCount = hours * 12; // 12 readings per hour
    
    for (let i = 0; i < readingsCount; i++) {
      const timeOffset = (readingsCount - i) * 5; // minutes ago
      const timestamp = new Date(now.getTime() - timeOffset * 60000);
      
      // Generate realistic variations
      const heartRate = Math.max(55, Math.min(110, 
        Math.round(profile.hrBase + (Math.random() - 0.5) * profile.hrVar * 2)
      ));
      
      const temperature = Math.max(36.0, Math.min(37.8,
        parseFloat((profile.tempBase + (Math.random() - 0.5) * 0.6).toFixed(1))
      ));
      
      const oxygenSat = Math.max(94, Math.min(100,
        Math.round(profile.o2Base + (Math.random() - 0.5) * 4)
      ));
      
      // Stress level based on heart rate and some randomness
      let stressLevel;
      const stressChance = Math.random();
      if (heartRate > 90 || stressChance > 0.8) {
        stressLevel = 'High';
      } else if (heartRate > 75 || stressChance > 0.5) {
        stressLevel = 'Medium';
      } else {
        stressLevel = 'Low';
      }
      
      data.push({
        id: `${patientId}-${timestamp.getTime()}`,
        patient_id: patientId,
        timestamp: timestamp.toISOString(),
        heart_rate: heartRate,
        temperature: temperature,
        oxygen_saturation: oxygenSat,
        stress_level: stressLevel,
        recorded_at: timestamp.toISOString()
      });
    }
    
    return data.reverse(); // Most recent first
  },

  // Get patient data with recent readings
  getPatientWithReadings: function(patientId) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return null;
    
    return {
      ...patient,
      recent_readings: this.generateHistoricalData(patientId, 6) // Last 6 hours
    };
  },

  // Get all patients with latest readings
  getAllPatientsWithLatest: function() {
    return this.patients.map(patient => ({
      ...patient,
      latest_reading: this.generateHistoricalData(patient.id, 1)[0] // Last 1 hour
    }));
  },

  // Generate new real-time reading for a patient
  generateNewReading: function(patientId) {
    const historicalData = this.generateHistoricalData(patientId, 1);
    const lastReading = historicalData[historicalData.length - 1];
    
    // Small variation from last reading
    const heartRate = Math.max(55, Math.min(110,
      lastReading.heart_rate + Math.round((Math.random() - 0.5) * 6)
    ));
    
    const temperature = Math.max(36.0, Math.min(37.8,
      parseFloat((lastReading.temperature + (Math.random() - 0.5) * 0.2).toFixed(1))
    ));
    
    const oxygenSat = Math.max(94, Math.min(100,
      lastReading.oxygen_saturation + Math.round((Math.random() - 0.5) * 2)
    ));
    
    // Stress level correlation with heart rate
    let stressLevel;
    if (heartRate > 90) {
      stressLevel = 'High';
    } else if (heartRate > 75) {
      stressLevel = 'Medium';
    } else {
      stressLevel = 'Low';
    }
    
    return {
      id: `${patientId}-${Date.now()}`,
      patient_id: patientId,
      timestamp: new Date().toISOString(),
      heart_rate: heartRate,
      temperature: temperature,
      oxygen_saturation: oxygenSat,
      stress_level: stressLevel,
      recorded_at: new Date().toISOString()
    };
  }
};

// Pre-generate some initial data
const initialData = {};
sampleDatabase.patients.forEach(patient => {
  initialData[patient.id] = sampleDatabase.generateHistoricalData(patient.id, 12);
});

export { sampleDatabase, initialData };