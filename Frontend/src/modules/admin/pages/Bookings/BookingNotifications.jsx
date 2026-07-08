import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiX, FiInfo, FiTrash2, FiLoader } from 'react-icons/fi';
import adminNotificationService from '../../../../services/adminNotificationService';
import { toast } from 'react-hot-toast';

const BookingNotifications = () => {
  const [filter, setFilter] = useState('All Types');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await adminNotificationService.getNotifications();
      if (res.success) {
        const mapped = res.data.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleString(),
          unread: !n.isRead,
          type: n.type,
          bookingId: n.data?.bookingNumber || 'N/A'
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = async () => {
    try {
      const res = await adminNotificationService.markAllAsRead();
      if (res.success) {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
        toast.success('All notifications marked as read');
        window.dispatchEvent(new Event('refreshSidebarCounts'));
      }
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await adminNotificationService.deleteNotification(id);
      if (res.success) {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted');
        window.dispatchEvent(new Event('refreshSidebarCounts'));
      }
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await adminNotificationService.markAsRead(id);
      if (res.success) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
        window.dispatchEvent(new Event('refreshSidebarCounts'));
      }
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking_created': return <FiBell className="text-blue-500 w-5 h-5" />;
      case 'booking_cancelled': return <FiBell className="text-red-500 w-5 h-5" />;
      case 'payment_failed': return <FiBell className="text-yellow-500 w-5 h-5" />;
      default: return <FiInfo className="text-gray-500 w-5 h-5" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'booking_created': return 'bg-blue-50';
      case 'booking_cancelled': return 'bg-red-50';
      case 'payment_failed': return 'bg-yellow-50';
      default: return 'bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(item => {
    if (filter === 'All Types') return true;
    if (filter === 'new_booking') return item.type === 'booking_created';
    if (filter === 'cancelled') return item.type === 'booking_cancelled';
    if (filter === 'payment_failed') return item.type === 'payment_failed';
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[150px]"
          >
            <option>All Types</option>
            <option value="new_booking">New Bookings</option>
            <option value="cancelled">Cancelled</option>
            <option value="payment_failed">Payment Issues</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-md">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        <AnimatePresence>
          {loading ? (
            <div className="p-8 text-center flex items-center justify-center gap-2 text-gray-500">
              <FiLoader className="animate-spin w-5 h-5 text-blue-600" />
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notifications found</div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group ${notification.unread ? 'bg-blue-50/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{notification.time}</span>
                      {notification.bookingId !== 'N/A' && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{notification.bookingId}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {notification.unread && (
                    <button
                      title="Mark as read"
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1 right-1" />
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookingNotifications;
