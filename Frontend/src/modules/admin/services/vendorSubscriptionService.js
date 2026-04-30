import api from '../../../services/api';

/**
 * Get all vendor subscription plans
 */
export const getAllPlans = async () => {
  try {
    const response = await api.get('/admin/vendor-subscriptions/plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor plans:', error);
    throw error;
  }
};

/**
 * Create a new subscription plan
 */
export const createPlan = async (planData) => {
  try {
    const response = await api.post('/admin/vendor-subscriptions/plans', planData);
    return response.data;
  } catch (error) {
    console.error('Error creating vendor plan:', error);
    throw error;
  }
};

/**
 * Update an existing subscription plan
 */
export const updatePlan = async (id, planData) => {
  try {
    const response = await api.put(`/admin/vendor-subscriptions/plans/${id}`, planData);
    return response.data;
  } catch (error) {
    console.error('Error updating vendor plan:', error);
    throw error;
  }
};

/**
 * Delete a subscription plan
 */
export const deletePlan = async (id) => {
  try {
    const response = await api.delete(`/admin/vendor-subscriptions/plans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vendor plan:', error);
    throw error;
  }
};

export default {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/vendor-subscriptions/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }
};
