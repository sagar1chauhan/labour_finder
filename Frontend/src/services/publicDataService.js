import api from './api';

/**
 * Service for fetching manpower categories, public workers, shops, and featured products
 * All data comes from the database — no mock/static data
 */
const publicDataService = {
  /**
   * Get all manpower categories (Engineer, Mason, Contractor, Vehicle Service, Rental Machine)
   */
  getManpowerCategories: async () => {
    try {
      const response = await api.get('/public/manpower-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching manpower categories:', error);
      return { success: false, categories: [] };
    }
  },

  /**
   * Get public workers filtered by category
   * @param {string} category - Service category filter (e.g., "Electrician")
   * @param {number} limit - Max results
   */
  getPublicWorkers: async (category = '', limit = 20) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit.toString());

      const response = await api.get(`/public/workers?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public workers:', error);
      return { success: false, workers: [] };
    }
  },

  /**
   * Get featured products grouped by category
   */
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/public/featured-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get vendor shops list
   * @param {string} category - Filter by service type
   */
  getPublicShops: async (category = '') => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await api.get(`/public/shops?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shops:', error);
      return { success: false, shops: [] };
    }
  }
};

export default publicDataService;
