import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiSearch, FiStar, FiMapPin, FiClock } from 'react-icons/fi';
import publicDataService from '../../../../services/publicDataService';
import LogoLoader from '../../../../components/common/LogoLoader';

const ShopCard = ({ id, name, rating, reviews, distance, deliveryTime, image, navigate }) => (
  <div 
    onClick={() => navigate(`/user/shop/${id}`)}
    className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-50 active:scale-[0.98] transition-all cursor-pointer mb-4 flex gap-3 p-3"
  >
    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
      <img 
        src={image || "https://img.freepik.com/free-vector/store-building-isolated-icon_24877-51111.jpg?w=740"} 
        alt={name} 
        className="w-full h-full object-cover" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://img.freepik.com/free-vector/store-building-isolated-icon_24877-51111.jpg?w=740";
        }}
      />
    </div>
    
    <div className="flex-1 py-1 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-black text-gray-900 leading-tight mb-1">{name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-green-700">
            <FiStar className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-bold">{rating || '4.5'}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">({reviews || '10+'})</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
        <div className="flex items-center gap-1">
          <FiMapPin className="w-3 h-3 text-gray-400" />
          <span>{distance || '1.5 km'}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiClock className="w-3 h-3 text-gray-400" />
          <span>{deliveryTime || '30 mins'}</span>
        </div>
      </div>
    </div>
  </div>
);

const ShopsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryTitle = searchParams.get('category') || 'Shops';

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const res = await publicDataService.getPublicShops(categoryTitle);
        if (res.success && res.shops) {
          setShops(res.shops);
        } else {
          setShops([]);
        }
      } catch (err) {
        console.error('Error fetching shops:', err);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [categoryTitle]);

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div 
        className="sticky top-0 z-20 px-4 pt-5 pb-3.5 shadow-sm"
        style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
      >
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => {
                   if (window.history.state && window.history.state.idx > 0) {
                     navigate(-1);
                   } else {
                     navigate('/user/categories');
                   }
                 }}
                 className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
               >
                 <FiArrowLeft className="w-4 h-4" />
               </button>
               <div>
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">Vendors</h2>
                  <p className="text-[10px] font-bold text-gray-800 tracking-wide leading-none mt-0.5">{categoryTitle}</p>
               </div>
            </div>
            <button className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20">
               <FiFilter className="w-4 h-4" />
            </button>
         </div>
         
         <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input 
               type="text" 
               placeholder={`Search vendors...`} 
               className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-yellow-100 shadow-sm text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cfdc01] transition-all h-[38px]"
            />
         </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar">
         {shops.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
             <div className="text-4xl mb-4">🏪</div>
             <p className="text-xs font-bold text-gray-500">No shops found for {categoryTitle}</p>
           </div>
         ) : (
           <div className="pb-24">
              {shops.map(shop => (
                 <ShopCard 
                    key={shop.id} 
                    {...shop} 
                    navigate={navigate}
                 />
              ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default ShopsList;
