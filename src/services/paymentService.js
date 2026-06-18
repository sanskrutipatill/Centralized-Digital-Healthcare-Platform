import api from './api';

export const paymentService = {
    // Create new order
    createOrder: async (appointmentId) => {
        const response = await api.post('/payment/create-order', { appointmentId });
        return response.data;
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        const response = await api.post('/payment/verify', paymentData);
        return response.data;
    },

    // Simulated Demo Payment
    demoPay: async (appointmentId) => {
        const response = await api.patch(`/appointments/${appointmentId}/demo-pay`);
        return response.data;
    }
};
