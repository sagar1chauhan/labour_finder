import api from '../../../services/api';

export const vendorCategoryService = {
  // Get all categories for vendor
  getCategories: async () => {
    try {
      const response = await api.get('/vendors/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new category
  createCategory: async (data) => {
    try {
      const response = await api.post('/vendors/categories', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/vendors/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a category
  updateCategory: async (id, data) => {
    try {
      const response = await api.put(`/vendors/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
