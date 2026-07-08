import api from './api';

const adminNotificationService = {
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications/admin', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error;
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications/delete-all');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
};

export default adminNotificationService;
