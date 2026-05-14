import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:8787';

export default function Appointments() {
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    appointment_type: '',
    doctor_name: '',
    department: '',
    scheduled_date: '',
    duration_minutes: 60,
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'scheduled' | 'completed' | 'cancelled'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  // If we navigated here from the OCR page, pre-fill notes with the extracted text.
  useEffect(() => {
    const incomingNotes = location.state?.ocrNotes;
    if (incomingNotes && !formData.notes) {
      setFormData((prev) => ({ ...prev, notes: incomingNotes }));
    }
  }, [location.state, formData.notes]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchAppointments(selectedPatientId);
    }
  }, [selectedPatientId]);

  async function fetchPatients() {
    try {
      const response = await fetch(`${API_URL}/api/patients`);
      const result = await response.json();
      const list = result.data || [];
      setPatients(list);
      if (list.length > 0) {
        setSelectedPatientId(list[0].id);
      }
      setIsLoading(false);
    } catch (e) {
      console.error('Failed to fetch patients:', e);
      setError('Unable to load patients. Please try again.');
      setIsLoading(false);
    }
  }

  async function fetchAppointments(patientId) {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/patients/${patientId}/appointments?limit=10`);
      const result = await response.json();
      setAppointments(result.data || []);
    } catch (e) {
      console.error('Failed to fetch appointments:', e);
      setError('Unable to load appointments for this patient.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'duration_minutes') {
        const minutes = timeStringToMinutes(value);
        return { ...prev, duration_minutes: minutes };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      if (name === 'duration_minutes') {
        const minutes = timeStringToMinutes(value);
        return { ...prev, duration_minutes: minutes };
      }
      return { ...prev, [name]: value };
    });
  };

  const toInputDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const timeStringToMinutes = (value) => {
    if (!value) return 0;
    const [hStr, mStr] = value.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return 0;
    return h * 60 + m;
  };

  const minutesToTimeString = (minutes) => {
    if (minutes == null) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}`;
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    if (!formData.scheduled_date) {
      setError('Please choose a date and time for the appointment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        // duration_minutes already stored as minutes from the hours field
        duration_minutes: formData.duration_minutes || 60,
      };

      const response = await fetch(`${API_URL}/api/patients/${selectedPatientId}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to create appointment');
      }

      const body = await response.json().catch(() => null);
      setLastCreated(body?.data || null);
      setShowSuccessModal(true);

      // Fallback native popup so user always sees confirmation
      if (typeof window !== 'undefined') {
        window.alert('Appointment scheduled successfully');
      }

      setFormData({
        appointment_type: '',
        doctor_name: '',
        department: '',
        scheduled_date: '',
        duration_minutes: 60,
        notes: '',
      });

      await fetchAppointments(selectedPatientId);
    } catch (e) {
      console.error('Failed to create appointment:', e);
      setError(e.message || 'Unable to create appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (appt) => {
    setEditingId(appt.id);
    setEditForm({
      appointment_type: appt.appointment_type || '',
      doctor_name: appt.doctor_name || '',
      department: appt.department || '',
      scheduled_date: toInputDateTime(appt.scheduled_date),
      duration_minutes: appt.duration_minutes || 30,
      status: appt.status || 'scheduled',
      notes: appt.notes || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleUpdateAppointment = async (apptId) => {
    if (!selectedPatientId || !editForm?.scheduled_date) {
      setError('Please choose a date and time for the appointment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/api/patients/${selectedPatientId}/appointments/${apptId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to update appointment');
      }

      setEditingId(null);
      setEditForm(null);
      await fetchAppointments(selectedPatientId);
    } catch (e) {
      console.error('Failed to update appointment:', e);
      setError(e.message || 'Unable to update appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!selectedPatientId) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/api/patients/${selectedPatientId}/appointments/${apptId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to delete appointment');
      }
      await fetchAppointments(selectedPatientId);
    } catch (e) {
      console.error('Failed to delete appointment:', e);
      setError(e.message || 'Unable to delete appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpcoming = (appt) => {
    const date = new Date(appt.scheduled_date);
    if (Number.isNaN(date.getTime())) return false;
    return date >= new Date();
  };

  const upcomingAppointments = useMemo(
    () => appointments.filter(isUpcoming),
    [appointments]
  );

  const filteredUpcomingAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (!isUpcoming(appt)) return false;
      if (statusFilter !== 'all') {
        const status = (appt.status || 'scheduled').toLowerCase();
        return status === statusFilter;
      }
      return true;
    });
  }, [appointments, statusFilter]);

  const filteredPastAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (isUpcoming(appt)) return false;
      if (statusFilter !== 'all') {
        const status = (appt.status || 'scheduled').toLowerCase();
        return status === statusFilter;
      }
      return true;
    });
  }, [appointments, statusFilter]);

  const upcomingCount = upcomingAppointments.length;
  const nextAppointment = upcomingAppointments[0] || null;

  const nextAppointmentDate = useMemo(() => {
    if (!nextAppointment) return null;
    try {
      return new Date(nextAppointment.scheduled_date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return nextAppointment.scheduled_date;
    }
  }, [nextAppointment]);

  if (isLoading && patients.length === 0) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
              <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-padding">
        <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                Patient <span className="gradient-text">Appointments</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                View and manage upcoming visits using the same patient context as your dashboard.
              </p>
            </div>

            {patients.length > 0 && (
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <select
                  value={selectedPatientId || ''}
                  onChange={(e) => setSelectedPatientId(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="card flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Upcoming appointments</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{upcomingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="card flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next appointment</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {nextAppointmentDate || 'No upcoming appointment'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="card flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {upcomingCount > 0 ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    Scheduled
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-slate-400" />
                    No upcoming visits
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Appointments layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Schedule block - large */}
          <div className="lg:col-span-2 space-y-6 lg:order-1">
            <div className="card p-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-2">
                Schedule an appointment
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Use the same HealthSync patient context to plan follow-up care, routine checkups, or
                teleconsultations. Appointments stay tightly aligned with real-time monitoring on the
                dashboard.
              </p>

              <form onSubmit={handleCreateAppointment} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Appointment type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {[
                      'General Check-up Appointment',
                      'Consultation Appointment',
                      'Follow-up Appointment',
                      'Diagnostic Appointment',
                      'Surgery/Procedure Appointment',
                      'Telehealth Appointment',
                      'Vaccination Appointment',
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, appointment_type: type }))}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors text-left ${
                          formData.appointment_type === type
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <input
                    name="appointment_type"
                    value={formData.appointment_type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Or enter a custom appointment type"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Doctor name
                    </label>
                    <input
                      name="doctor_name"
                      value={formData.doctor_name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Dr. Mehta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Department
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {[
                        'General Medicine',
                        'Gastroenterology (stomach, liver, intestines)',
                        'Endocrinology (hormones, diabetes)',
                        'Nephrology (kidney)',
                        'Rheumatology (joints, autoimmune diseases)',
                        'Pulmonology (lungs)',
                        'Hematology (blood disorders)',
                        'Emergency',
                      ].map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, department: dept }))}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors text-left ${
                            formData.department === dept
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Or enter a custom department"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Date & time *
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="scheduled_date"
                      value={formData.scheduled_date}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration (HH:MM)
                    </label>
                    <input
                      type="time"
                      name="duration_minutes"
                      step="900"
                      value={minutesToTimeString(formData.duration_minutes)}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Any preparation or special instructions for this visit"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || !selectedPatientId}
                  className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule appointment'}
                </motion.button>
              </form>
            </div>
          </div>

          {/* Appointments list - smaller column */}
          <div className="card p-6 lg:order-2">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Appointments
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Synced with patient dashboard
                </span>
              </div>

              <div className="flex justify-end">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Upcoming appointments */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Upcoming appointments
              </h3>
              {filteredUpcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No upcoming appointments.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredUpcomingAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="mt-1">
                        <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {appt.appointment_type || 'Appointment'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(appt.scheduled_date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {editingId === appt.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                name="appointment_type"
                                value={editForm?.appointment_type || ''}
                                onChange={handleEditChange}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Appointment type"
                              />
                              <input
                                name="doctor_name"
                                value={editForm?.doctor_name || ''}
                                onChange={handleEditChange}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Doctor name"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                name="department"
                                value={editForm?.department || ''}
                                onChange={handleEditChange}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Department"
                              />
                              <input
                                type="datetime-local"
                                name="scheduled_date"
                                value={editForm?.scheduled_date || ''}
                                onChange={handleEditChange}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="time"
                                name="duration_minutes"
                                step="900"
                                value={minutesToTimeString(editForm?.duration_minutes)}
                                onChange={handleEditChange}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                name="status"
                                value={editForm?.status || 'scheduled'}
                                onChange={handleEditChange}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Status"
                              />
                            </div>
                            <textarea
                              name="notes"
                              rows={2}
                              value={editForm?.notes || ''}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="Notes"
                            />
                            <div className="flex flex-wrap gap-2 justify-end">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateAppointment(appt.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700"
                                disabled={isSubmitting}
                              >
                                Save changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                              {appt.doctor_name && (
                                <span className="inline-flex items-center gap-1">
                                  <UserIcon className="h-4 w-4" />
                                  {appt.doctor_name}
                                </span>
                              )}
                              {appt.department && (
                                <span className="inline-flex items-center gap-1">
                                  <BuildingOfficeIcon className="h-4 w-4" />
                                  {appt.department}
                                </span>
                              )}
                              {appt.duration_minutes && (
                                <span className="inline-flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  {appt.duration_minutes} min
                                </span>
                              )}
                              {appt.status && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                  {appt.status}
                                </span>
                              )}
                            </div>

                            {appt.notes && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {appt.notes}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(appt)}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(appt.id)}
                                className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                disabled={isSubmitting}
                              >
                                Cancel appointment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past appointments */}
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Past appointments
              </h3>
              {filteredPastAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No past appointments.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredPastAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 opacity-80"
                    >
                      <div className="mt-1">
                        <CalendarDaysIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {appt.appointment_type || 'Appointment'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(appt.scheduled_date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                          {appt.doctor_name && (
                            <span className="inline-flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {appt.doctor_name}
                            </span>
                          )}
                          {appt.department && (
                            <span className="inline-flex items-center gap-1">
                              <BuildingOfficeIcon className="h-3 w-3" />
                              {appt.department}
                            </span>
                          )}
                          {appt.duration_minutes && (
                            <span className="inline-flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {appt.duration_minutes} min
                            </span>
                          )}
                          {appt.status && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {appt.status}
                            </span>
                          )}
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {appt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {showSuccessModal && (
        <>
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black/60">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Appointment scheduled
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {lastCreated?.appointment_type || 'Appointment'} has been scheduled for{' '}
                {lastCreated?.scheduled_date
                  ? new Date(lastCreated.scheduled_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'the selected time'}
                .
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>

          {/* Debug toast so we can verify the flag updates even if overlay has styling issues */}
          <div className="fixed bottom-4 right-4 z-[10000] bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Appointment scheduled successfully
          </div>
        </>
      )}
    </>
  );
}
