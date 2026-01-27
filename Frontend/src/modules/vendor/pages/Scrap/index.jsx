import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';

const VendorScrapPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my'
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScrap();
  }, [activeTab]);

  const fetchScrap = async () => {
    try {
      setLoading(true);
      if (activeTab === 'available') {
        const res = await api.get('/scrap/available');
        if (res.data.success) setScraps(res.data.data);
      } else {
        const res = await api.get('/scrap/my-accepted');
        if (res.data.success) setScraps(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await api.put(`/scrap/${id}/accept`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchScrap(); // Refresh available list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await api.put(`/scrap/${id}/complete`);
      if (res.data.success) {
        toast.success('Pickup marked as completed');
        fetchScrap();
      }
    } catch (err) {
      toast.error('Failed to complete');
    }
  };

  // UI for accepting
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Scrap Requests" showBack={true} />

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 mt-1">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'available' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          style={{ borderColor: activeTab === 'available' ? themeColors.button : 'transparent', color: activeTab === 'available' ? themeColors.button : undefined }}
        >
          Available Scraps
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'my' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          style={{ borderColor: activeTab === 'my' ? themeColors.button : 'transparent', color: activeTab === 'my' ? themeColors.button : undefined }}
        >
          My Pickups
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading ? <div className="text-center py-10">Loading...</div> : scraps.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No active requests found.</div>
        ) : (
          scraps.map(item => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all"
              onClick={() => navigate(`/vendor/scrap/${item._id}`)}
            >
              <div className="flex gap-4">
                {item.images && item.images.length > 0 && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.category}</span>
                      <h3 className="font-extrabold text-gray-900 mt-1 line-clamp-1">{item.title}</h3>
                      <p className="text-sm font-bold text-gray-600 mt-0.5">{item.quantity} • ₹{item.expectedPrice || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[11px] font-medium text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                <FiMapPin className="w-3.5 h-3.5 mt-0.5 text-red-500" />
                <div className="line-clamp-2">
                  <span>{item.address?.addressLine1}, {item.address?.city}</span>
                </div>
              </div>

              {activeTab === 'available' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept(item._id);
                  }}
                  className="w-full mt-4 py-3 rounded-xl text-white font-black text-sm shadow-lg active:scale-95 transition-all shadow-blue-100"
                  style={{ backgroundColor: themeColors.button }}
                >
                  Confirm Pickup / Buy
                </button>
              )}

              {activeTab === 'my' && (
                <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <FiPhone className="w-4 h-4 text-blue-600" />
                    </div>
                    <a
                      href={`tel:${item.userId?.phone}`}
                      className="hover:text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.userId?.phone || 'No Phone'}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`capitalize text-[10px] font-black px-3 py-1 rounded-full border ${item.status === 'accepted' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default VendorScrapPage;
