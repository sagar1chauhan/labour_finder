import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiCalendar, FiClock, FiCheckCircle, FiInfo, FiTag, FiPackage, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';

const ScrapDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScrapDetails();
  }, [id]);

  const fetchScrapDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/scrap/${id}`);
      if (res.data.success) {
        setScrap(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const res = await api.put(`/scrap/${id}/accept`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchScrapDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleComplete = async () => {
    try {
      const res = await api.put(`/scrap/${id}/complete`);
      if (res.data.success) {
        toast.success('Pickup marked as completed');
        fetchScrapDetails();
      }
    } catch (err) {
      toast.error('Failed to complete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading scrap details...</p>
      </div>
    );
  }

  if (!scrap) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center">
        <FiInfo className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-black text-gray-900">Not Found</h2>
        <p className="text-gray-500 mt-2">The scrap listing could not be found or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-900 border border-gray-100 active:scale-90 transition-all"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-gray-900">Listing Details</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* Image Gallery */}
        {scrap.images && scrap.images.length > 0 ? (
          <div className="space-y-3">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
              <img
                src={scrap.images[0]}
                alt={scrap.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/600x450?text=Image+Load+Error'; }}
              />
            </div>
            {scrap.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {scrap.images.slice(1).map((img, i) => (
                  <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt="Scrap"
                      onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Error'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gray-100 rounded-[32px] flex flex-col items-center justify-center border border-dashed border-gray-200">
            <FiPackage className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Photos Provided</p>
          </div>
        )}

        {/* Primary Info */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100 italic">
              {scrap.category}
            </span>
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${scrap.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              scrap.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                'bg-gray-50 text-gray-500 border-gray-100'
              }`}>
              {scrap.status}
            </span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 leading-tight">{scrap.title}</h2>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Price</p>
              <p className="text-xl font-black text-blue-600 font-mono">₹{scrap.expectedPrice || 'Best Price'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
              <p className="text-xl font-black text-gray-900">{scrap.quantity}</p>
            </div>
          </div>

          {scrap.description && (
            <div className="pt-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-gray-600 font-medium leading-relaxed italic border-l-4 border-blue-100 pl-4 bg-blue-50/30 py-2 rounded-r-xl">
                "{scrap.description}"
              </p>
            </div>
          )}
        </div>

        {/* Location & Contact */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-6">
          <div>
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <FiMapPin className="text-red-500" />
              </div>
              Pickup Location
            </h3>
            <div className="pl-10 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 border-dashed border-l-2"></div>
              <p className="font-bold text-gray-900">{scrap.address?.addressLine1}</p>
              <p className="text-sm text-gray-500 mt-1">{scrap.address?.city}, {scrap.address?.state} - {scrap.address?.pincode}</p>
            </div>
          </div>

          {scrap.status === 'accepted' && (
            <div className="pt-4 border-t border-gray-50">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FiPhone className="text-blue-500" />
                </div>
                Customer Contact
              </h3>
              <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-0.5">Primary Phone</p>
                  <p className="text-lg font-black text-gray-900">{scrap.userId?.phone || 'Not Shared'}</p>
                </div>
                <a
                  href={`tel:${scrap.userId?.phone}`}
                  className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all font-black text-xl"
                >
                  <FiPhone />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Date Info */}
        <div className="flex items-center justify-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/50 backdrop-blur py-4 rounded-2xl border border-white">
          <div className="flex items-center gap-1.5">
            <FiCalendar />
            <span>Posted {new Date(scrap.createdAt).toLocaleDateString()}</span>
          </div>
          {scrap.pickupDate && (
            <div className="flex items-center gap-1.5 text-green-600">
              <FiClock />
              <span>Accepted {new Date(scrap.pickupDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
        {scrap.status === 'pending' ? (
          <button
            onClick={handleAccept}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            Confirm Booking / Buy Now
          </button>
        ) : scrap.status === 'accepted' ? (
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-100 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            Mark Project Completed
          </button>
        ) : (
          <button
            disabled
            className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-wider"
          >
            Transaction Completed
          </button>
        )}
      </div>
    </div>
  );
};

export default ScrapDetails;
