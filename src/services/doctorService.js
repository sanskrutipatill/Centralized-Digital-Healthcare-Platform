import api from './api';

export const doctorService = {
  // Get patients assigned to the logged-in doctor
  getPatients: async () => {
    const response = await api.get('/doctors/patients');
    return response.data;
  },

  // Delete a patient from doctor's list (delete all appointments with this patient)
  deletePatient: async (patientId) => {
    const response = await api.delete(`/doctors/patient/${patientId}`);
    return response.data;
  },

  // Update doctor's profile (basic info)
  updateProfile: async (profileData) => {
    const response = await api.put('/doctors/profile', profileData);
    return response.data;
  },

  // Update doctor's affiliation (hospital and department)
  updateAffiliation: async (affiliationData) => {
    const response = await api.put('/doctors/affiliation', affiliationData);
    return response.data;
  },

  // Update doctor's availability
  updateAvailability: async (availabilityData) => {
    const response = await api.put('/doctors/availability', availabilityData);
    return response.data;
  }
};

