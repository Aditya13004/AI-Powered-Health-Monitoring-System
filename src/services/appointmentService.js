import { supabase } from '../lib/supabase';

// Helper to get the current authenticated user's ID
const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

export const appointmentService = {
  // Get all patients for the current user
  getPatients: async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { data: [], error: error.message };
    }
  },

  // Create a patient
  createPatient: async (patientData) => {
    try {
      const userId = await getCurrentUserId();
      const payload = {
        user_id: userId,
        ...patientData
      };
      const { data, error } = await supabase
        .from('patients')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating patient:', error);
      return { data: null, error: error.message };
    }
  },

  // Get appointments for a specific patient
  getAppointments: async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { data: [], error: error.message };
    }
  },

  // Create a new appointment
  createAppointment: async (patientId, appointmentData) => {
    try {
      const userId = await getCurrentUserId();
      
      const payload = {
        user_id: userId,
        patient_id: patientId,
        appointment_type: appointmentData.appointment_type,
        scheduled_date: appointmentData.scheduled_date,
        duration_minutes: appointmentData.duration_minutes,
        doctor_name: appointmentData.doctor_name,
        department: appointmentData.department,
        notes: appointmentData.notes,
        status: appointmentData.status || 'scheduled',
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { data: null, error: error.message };
    }
  },

  // Update an existing appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const payload = {
        appointment_type: appointmentData.appointment_type,
        scheduled_date: appointmentData.scheduled_date,
        duration_minutes: appointmentData.duration_minutes,
        doctor_name: appointmentData.doctor_name,
        department: appointmentData.department,
        notes: appointmentData.notes,
        status: appointmentData.status,
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete an appointment
  deleteAppointment: async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, error: error.message };
    }
  }
};
