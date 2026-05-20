import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiLoader, FiCalendar, FiChevronRight, FiZap, FiPackage, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import NotificationBell from '../../components/common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService } from '../../../../services/bookingService';

const DUMMY_BOOKINGS = [
  { 
    id: 'b1', 
    bookingNumber: 'BK-7892', 
    serviceName: 'Full Home Deep Cleaning', 
    serviceCategory: 'Cleaning',
    status: 'confirmed', 
    scheduledDate: new Date().toISOString(), 
    scheduledTime: '10:00 AM', 
    address: 'Flat 402, Sunshine Residency',
    totalAmount: 2499
  },
  { 
    id: 'b2', 
    bookingNumber: 'BK-4421', 
    serviceName: 'AC Filter Cleaning', 
    serviceCategory: 'AC Service',
    status: 'in-progress', 
    scheduledDate: new Date().toISOString(), 
    scheduledTime: '02:30 PM', 
    address: 'Plot 12, Vijay Nagar',
    totalAmount: 1850
  },
];

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(DUMMY_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings(filter !== 'all' ? { status: filter } : {});
      if (response?.success && response.data?.length > 0) setBookings(response.data);
      else if (filter === 'all') setBookings(DUMMY_BOOKINGS);
      else setBookings([]);
    } catch (error) { setBookings(filter === 'all' ? DUMMY_BOOKINGS : []); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    loadBookings();
    window.addEventListener('userBookingsUpdated', loadBookings);
    return () => window.removeEventListener('userBookingsUpdated', loadBookings);
  }, [loadBookings]);

  const getStatusInfo = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'confirmed' || s === 'accepted') return { icon: <FiCheckCircle className="w-3 h-3" />, color: 'bg-emerald-500', label: 'Confirmed' };
    if (s.includes('progress')) return { icon: <FiLoader className="w-3 h-3 animate-spin" />, color: 'bg-amber-500', label: 'In Progress' };
    if (s === 'completed') return { icon: <FiCheckCircle className="w-3 h-3" />, color: 'bg-blue-500', label: 'Completed' };
    if (s === 'cancelled') return { icon: <FiXCircle className="w-3 h-3" />, color: 'bg-rose-500', label: 'Cancelled' };
    return { icon: <FiClock className="w-3 h-3" />, color: 'bg-gray-400', label: status || 'Pending' };
  };

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden relative" style={{ backgroundColor: '#fbfde8' }}>
      <div className="relative z-10">
        <header 
          className="px-6 pt-10 pb-5 rounded-b-[32px] shadow-md shadow-gray-200/50"
          style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase">My Bookings</h1>
                <p className="text-[8px] font-bold text-gray-800 uppercase tracking-[0.2em] opacity-80 leading-none mt-0.5">Track History</p>
              </div>
            </div>
            <NotificationBell navigate={navigate} />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'confirmed', 'in-progress', 'completed'].map(id => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === id 
                  ? 'bg-[#0f172a] text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-100 shadow-sm'}`}
              >
                {id.replace('-', ' ')}
              </button>
            ))}
          </div>
        </header>

        <main className="px-6 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {loading && bookings.length === 0 ? (
              [1,2].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-[24px] border border-gray-50" />)
            ) : (
              bookings.map((booking) => {
                const status = getStatusInfo(booking.status);
                return (
                  <motion.div
                    key={booking.id || booking._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/user/booking/${booking._id || booking.id}`)}
                    className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 active:scale-[0.98] transition-all cursor-pointer relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[8px] font-black text-[#889400] bg-[#889400]/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                             {booking.serviceCategory || 'Service'}
                           </span>
                           <span className="text-[8px] font-bold text-gray-300 tracking-tighter">#{booking.bookingNumber || 'BK-7892'}</span>
                        </div>
                        <h3 className="text-[11px] font-black text-gray-900 leading-tight line-clamp-1">{booking.serviceName}</h3>
                      </div>
                      <div className={`${status.color} text-white px-2 py-0.5 rounded-lg flex items-center gap-1 text-[7px] font-black uppercase tracking-widest shadow-sm`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="bg-gray-50/50 rounded-xl p-2 flex items-center gap-2.5">
                        <FiCalendar className="w-3.5 h-3.5 text-[#889400]" />
                        <div>
                          <p className="text-[7px] font-bold text-gray-400 uppercase leading-none mb-0.5">Date</p>
                          <p className="text-[9px] font-black text-gray-800">{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-xl p-2 flex items-center gap-2.5">
                        <FiClock className="w-3.5 h-3.5 text-[#889400]" />
                        <div>
                          <p className="text-[7px] font-bold text-gray-400 uppercase leading-none mb-0.5">Time</p>
                          <p className="text-[9px] font-black text-gray-800">{booking.scheduledTime || '10:00 AM'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-gray-300 w-3 h-3" />
                        <p className="text-[9px] font-bold text-gray-400 truncate max-w-[120px] uppercase tracking-tighter">
                          {typeof booking.address === 'object' ? booking.address.city : (booking.address || 'Indore')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-amber-600">₹{booking.totalAmount || 0}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {bookings.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <FiPackage className="w-14 h-14 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Bookings Yet</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyBookings;
