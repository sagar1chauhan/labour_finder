import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiFilter, FiSearch, FiStar, FiMapPin, FiClock } from 'react-icons/fi';

const DUMMY_SHOPS = [
  {
    id: 's1',
    name: "Shreeji Hardware & Tools",
    rating: "4.8",
    reviews: 124,
    distance: "1.2 km",
    deliveryTime: "30 mins",
    image: "https://img.freepik.com/free-photo/view-hardware-store-with-tools-equipment_23-2151693766.jpg?w=740",
    tags: ["Hardware Tool Shop", "Plywood Traders"]
  },
  {
    id: 's2',
    name: "Laxmi Electricals",
    rating: "4.9",
    reviews: 89,
    distance: "2.5 km",
    deliveryTime: "45 mins",
    image: "https://img.freepik.com/free-photo/electric-tools-market_1398-3168.jpg?w=740",
    tags: ["Electrical Shop"]
  },
  {
    id: 's3',
    name: "Gupta Cement Agency",
    rating: "4.6",
    reviews: 210,
    distance: "0.8 km",
    deliveryTime: "25 mins",
    image: "https://img.freepik.com/free-photo/sack-cement-plaster-building-site_1150-13768.jpg?w=740",
    tags: ["Cement Dealers"]
  },
  {
    id: 's4',
    name: "Balaji Plywood Center",
    rating: "4.7",
    reviews: 156,
    distance: "3.1 km",
    deliveryTime: "60 mins",
    image: "https://img.freepik.com/free-photo/wooden-planks-stack-background_1398-4663.jpg?w=740",
    tags: ["Plywood Traders"]
  },
  {
    id: 's5',
    name: "SafeTech Industrial Safety",
    rating: "4.9",
    reviews: 320,
    distance: "4.0 km",
    deliveryTime: "45 mins",
    image: "https://img.freepik.com/free-photo/construction-safety-equipment_1398-4179.jpg?w=740",
    tags: ["Safety Gear Shop", "Helmet Suppliers"]
  }
];

const ShopCard = ({ id, name, rating, reviews, distance, deliveryTime, image, navigate }) => (
  <div 
    onClick={() => navigate(`/user/shop/${id}`)}
    className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-50 active:scale-[0.98] transition-all cursor-pointer mb-4 flex gap-3 p-3"
  >
    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
      <img 
        src={image} 
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
            <span className="text-[10px] font-bold">{rating}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">({reviews})</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
        <div className="flex items-center gap-1">
          <FiMapPin className="w-3 h-3 text-gray-400" />
          <span>{distance}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiClock className="w-3 h-3 text-gray-400" />
          <span>{deliveryTime}</span>
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

  const shops = useMemo(() => {
    return DUMMY_SHOPS.filter(s => 
      s.tags.some(tag => tag.toLowerCase().includes(categoryTitle.toLowerCase()) || categoryTitle.toLowerCase().includes(tag.toLowerCase()))
    );
  }, [categoryTitle]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div 
        className="sticky top-0 z-20 px-4 pt-5 pb-3.5 shadow-sm"
        style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
      >
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => navigate(-1)}
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
