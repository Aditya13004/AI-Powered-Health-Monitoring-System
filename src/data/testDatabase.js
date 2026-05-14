// Test script to verify sample database functionality
import { sampleDatabase } from './sampleDatabase';

console.log('=== HealthSync Sample Database Test ===\n');

// Test 1: Get all patients
console.log('1. Available Patients:');
const patients = sampleDatabase.patients;
patients.forEach(patient => {
  console.log(`   - ${patient.first_name} ${patient.last_name} (ID: ${patient.id}) - ${patient.condition}`);
});

console.log('\n2. Sample Data Generation:');

// Test 2: Generate data for first patient
const firstPatient = patients[0];
console.log(`\nGenerating 6 hours of data for ${firstPatient.first_name} ${firstPatient.last_name}:`);

const testData = sampleDatabase.generateHistoricalData(firstPatient.id, 6);
console.log(`Generated ${testData.length} readings`);

// Show first and last readings
console.log('\nFirst reading:');
console.log(`  Heart Rate: ${testData[0].heart_rate} bpm`);
console.log(`  Temperature: ${testData[0].temperature}°C`);
console.log(`  Oxygen Sat: ${testData[0].oxygen_saturation}%`);
console.log(`  Stress Level: ${testData[0].stress_level}`);

console.log('\nLatest reading:');
const latest = testData[testData.length - 1];
console.log(`  Heart Rate: ${latest.heart_rate} bpm`);
console.log(`  Temperature: ${latest.temperature}°C`);
console.log(`  Oxygen Sat: ${latest.oxygen_saturation}%`);
console.log(`  Stress Level: ${latest.stress_level}`);

// Test 3: Generate new real-time reading
console.log('\n3. New Real-time Reading:');
const newReading = sampleDatabase.generateNewReading(firstPatient.id);
console.log(`  Heart Rate: ${newReading.heart_rate} bpm`);
console.log(`  Temperature: ${newReading.temperature}°C`);
console.log(`  Oxygen Sat: ${newReading.oxygen_saturation}%`);
console.log(`  Stress Level: ${newReading.stress_level}`);

console.log('\n=== Test Complete ===');