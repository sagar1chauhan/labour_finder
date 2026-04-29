import api from './api';

const stockService = {
  // Vendor Methods
  createRequest: async (data) => {
    const response = await api.post('/stock/request', data);
    return response.data;
  },
  
  getMyRequests: async () => {
    const response = await api.get('/stock/my-requests');
    return response.data;
  },
  
  getAvailableParts: async () => {
    const response = await api.get('/stock/parts');
    return response.data;
  },

  // Admin Methods
  getAllRequests: async (params = {}) => {
    const response = await api.get('/stock/admin/all', { params });
    return response.data;
  },
  
  updateRequestStatus: async (requestId, data) => {
    const response = await api.put(`/stock/admin/${requestId}/status`, data);
    return response.data;
  }
};

export default stockService;
