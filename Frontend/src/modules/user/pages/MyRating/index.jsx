import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiUser, FiBriefcase, FiCalendar, FiMessageSquare, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { bookingService } from '../../../../services/bookingService';

const MyRating = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchRatings = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await bookingService.getRatings({ page, limit: 10 });
      if (response.success) {
        setRatings(page === 1 ? response.data : [...ratings, ...response.data]);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || 'Failed to fetch ratings');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] pb-24">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/30 via-white to-white" />
      </div>

      <div className="relative z-10">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-50 sticky top-0 z-30">
          <div className="px-6 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-800" />
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">My Reviews</h1>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Feedback History</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 space-y-6">
          {isLoading && pagination.page === 1 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FiLoader className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <p className="text-sm font-black text-gray-400">Loading reviews...</p>
            </div>
          ) : ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating, idx) => (
                <div
                  key={rating._id || idx}
                  className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center overflow-hidden border border-amber-100">
                        {rating.vendorId?.profilePhoto ? (
                          <img src={rating.vendorId.profilePhoto} alt={rating.vendorId.name} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-6 h-6 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{rating.vendorId?.businessName || rating.vendorId?.name || 'Service Provider'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FiStar
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= rating.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-100'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{formatDate(rating.reviewedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {rating.review && (
                    <p className="text-gray-600 text-xs leading-relaxed font-medium pl-3 border-l-4 border-amber-200">
                      "{rating.review}"
                    </p>
                  )}

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiBriefcase className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Booking #{rating.bookingNumber}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/user/booking/${rating.bookingId || rating._id}`)}
                      className="text-[10px] font-black text-amber-600 uppercase tracking-widest"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-8 text-center shadow-sm border border-gray-50 py-20">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6 mx-auto">
                <FiStar className="w-10 h-10 text-amber-200" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-[200px] mx-auto">
                Completed bookings will appear here once you share your feedback.
              </p>
              <button
                onClick={() => navigate('/user/my-bookings')}
                className="mt-8 px-10 py-4 bg-amber-500 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-amber-100 active:scale-95 transition-all"
              >
                Go to My Bookings
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyRating;
