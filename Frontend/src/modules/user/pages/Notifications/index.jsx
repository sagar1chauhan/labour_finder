import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiArrowLeft, FiTrash2, FiX, FiZap, FiCreditCard, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../../components/layout/BottomNav';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../../services/notificationService';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('userNotificationsUpdated', handleUpdate);
    return () => window.removeEventListener('userNotificationsUpdated', handleUpdate);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) { console.error(error); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Removed');
    } catch (error) { console.error(error); }
  };

  const confirmClearAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      toast.success('Cleared');
      setShowClearConfirm(false);
    } catch (error) { console.error(error); }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    const type = (notif.type || '').toLowerCase();
    if (filter === 'payments') return ['payment_', 'refund_', 'wallet_'].some(p => type.includes(p));
    if (filter === 'jobs') return ['booking_', 'job_', 'worker_', 'visit_'].some(p => type.includes(p));
    return type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      <div className="relative z-10">
        <header className="bg-[#0D9488] px-6 pt-5 pb-4 rounded-b-[24px] shadow-lg shadow-teal-900/20 sticky top-0 z-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight leading-tight">Notifications</h1>
                <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest opacity-80">Recent Alerts</p>
              </div>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="w-10 h-10 bg-red-50/10 backdrop-blur-xl text-red-100 rounded-2xl flex items-center justify-center border border-red-100/20 active:scale-90 transition-all"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['all', 'jobs', 'payments'].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === opt 
                  ? 'bg-white text-teal-600 shadow-lg' 
                  : 'bg-white/10 text-teal-50 border border-white/10'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </header>

        <main className="px-6 pt-8 pb-12">
          {notifications.length > 0 && (
             <div className="flex justify-end mb-6">
               <button onClick={handleMarkAllRead} className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-xl">Mark all as read</button>
             </div>
          )}

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-[32px] shadow-sm border border-gray-50" />)
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <FiBell className="w-16 h-16 mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">All caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white rounded-[32px] p-4 shadow-sm border border-gray-50 flex items-start gap-4 relative overflow-hidden ${!notif.read ? 'border-l-4 border-l-[#0D9488]' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-50 text-gray-400' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
                      {notif.type?.includes('payment') ? <FiCreditCard className="w-5 h-5" /> : <FiZap className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 pr-12">
                      <h3 className={`text-[12px] font-black text-gray-900 mb-1 ${!notif.read ? '' : 'text-gray-500'}`}>{notif.title}</h3>
                      <p className="text-[11px] font-bold text-gray-400 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-gray-400 uppercase tracking-tight">
                         <FiClock className="w-3 h-3" />
                         <span>{notif.time || 'Just now'}</span>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {!notif.read && (
                        <button onClick={() => handleMarkAsRead(notif.id)} className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 active:scale-90 transition-all shadow-sm">
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={(e) => handleDelete(e, notif.id)} className="w-8 h-8 bg-red-50 text-red-400 rounded-xl flex items-center justify-center border border-red-50 active:scale-90 transition-all shadow-sm">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <BottomNav />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 text-center mb-2">Clear All?</h3>
              <p className="text-[11px] font-bold text-gray-400 text-center mb-8 leading-relaxed px-4">You will lose all your notification history.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmClearAll} className="w-full h-12 bg-red-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all">Yes, Clear All</button>
                <button onClick={() => setShowClearConfirm(false)} className="w-full h-12 bg-gray-50 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
