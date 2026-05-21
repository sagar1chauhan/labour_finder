import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiFilter, FiSearch, FiStar, FiCheckCircle, FiMessageCircle, FiPhone, FiZap, FiHeart, FiShare2 } from 'react-icons/fi';
import { useCart } from '../../../../context/CartContext';
import { toast } from 'react-hot-toast';

// Dummy Workers matching the same in Home/index.jsx
const DUMMY_WORKERS = [
  {
    id: 1,
    name: "Ramesh Kumar",
    type: "Plumber",
    rating: "4.8 (124 reviews)",
    experience: "5 Years",
    image: "https://img.freepik.com/free-photo/plumber-ready-work_23-2147744158.jpg?w=740"
  },
  {
    id: 2,
    name: "Suresh Singh",
    type: "Electrician",
    rating: "4.9 (201 reviews)",
    experience: "8 Years",
    image: "https://img.freepik.com/free-photo/smiling-electrician-fixing-electrical-panel_23-2147772322.jpg?w=740"
  },
  {
    id: 3,
    name: "Amit Sharma",
    type: "Carpenter",
    rating: "4.7 (89 reviews)",
    experience: "3 Years",
    image: "https://img.freepik.com/free-photo/carpenter-working-wood_23-2147772344.jpg?w=740"
  },
  {
    id: 4,
    name: "Vikram Patel",
    type: "Architect",
    rating: "4.9 (340 reviews)",
    experience: "10 Years",
    image: "https://img.freepik.com/free-photo/architect-working-office_23-2147772345.jpg?w=740"
  },
  {
    id: 5,
    name: "Rahul Verma",
    type: "Engineer",
    rating: "4.8 (150 reviews)",
    experience: "6 Years",
    image: "https://img.freepik.com/free-photo/engineer-working-office_23-2147772346.jpg?w=740"
  },
  {
    id: 6,
    name: "Prakash Yadav",
    type: "Mason",
    rating: "4.6 (95 reviews)",
    experience: "4 Years",
    image: "https://img.freepik.com/free-photo/mason-working-construction-site_23-2147772347.jpg?w=740"
  },
  {
    id: 7,
    name: "Priya Singh",
    type: "Architect",
    rating: "4.9 (180 reviews)",
    experience: "7 Years",
    image: "https://img.freepik.com/free-photo/young-female-architect-working-office_23-2147772348.jpg?w=740"
  },
  {
    id: 8,
    name: "Rahul Desai",
    type: "Architect",
    rating: "4.7 (120 reviews)",
    experience: "4 Years",
    image: "https://img.freepik.com/free-photo/male-architect-working-office_23-2147772349.jpg?w=740"
  },
  {
    id: 9,
    name: "Neha Gupta",
    type: "Architect",
    rating: "4.8 (210 reviews)",
    experience: "9 Years",
    image: "https://img.freepik.com/free-photo/female-architect-working-office_23-2147772350.jpg?w=740"
  },
  {
    id: 10,
    name: "Sanjay Kumar",
    type: "Engineer",
    rating: "4.9 (300 reviews)",
    experience: "12 Years",
    image: "https://img.freepik.com/free-photo/male-engineer-working-office_23-2147772351.jpg?w=740"
  },
  {
    id: 11,
    name: "Manoj Builders",
    type: "Building contractor",
    rating: "4.8 (240 reviews)",
    experience: "15 Years",
    image: "https://img.freepik.com/free-photo/building-construction-site-with-scaffolding_1127-2856.jpg?w=740"
  },
  {
    id: 12,
    name: "Apex Renovations",
    type: "Renovation contractor",
    rating: "4.7 (195 reviews)",
    experience: "8 Years",
    image: "https://img.freepik.com/free-photo/man-renovating-house_23-2148187834.jpg?w=740"
  },
  {
    id: 13,
    name: "Dream Interiors",
    type: "Interior contractor",
    rating: "4.9 (310 reviews)",
    experience: "10 Years",
    image: "https://img.freepik.com/free-photo/modern-interior-design-with-home-decor_23-2148301549.jpg?w=740"
  },
  {
    id: 14,
    name: "Rao Construction Co.",
    type: "Building contractor",
    rating: "4.6 (150 reviews)",
    experience: "12 Years",
    image: "https://img.freepik.com/free-photo/construction-manager-with-hard-hat_114579-2428.jpg?w=740"
  },
  {
    id: 15,
    name: "Modern Living Interiors",
    type: "Interior contractor",
    rating: "4.8 (185 reviews)",
    experience: "6 Years",
    image: "https://img.freepik.com/free-photo/interior-design-concept-with-furniture_23-2148301545.jpg?w=740"
  }
];

const WorkerCard = ({ name, type, rating, experience, image, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-[20px] p-2 shadow-sm border border-gray-50 group active:scale-[0.98] transition-all cursor-pointer"
  >
    <div className="relative w-full aspect-square rounded-[16px] overflow-hidden mb-2 bg-gray-50">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?w=740";
        }}
      />
      <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md px-1 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
        <FiStar className="w-2 h-2 text-orange-400 fill-current" />
        <span className="text-[7px] font-black text-gray-800">{rating.split(' ')[0]}</span>
      </div>
    </div>
    <div className="px-1">
      <h3 className="text-[9px] font-black text-gray-900 truncate mb-0.5">{name}</h3>
      <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">{experience}</p>
    </div>
  </div>
);

const ServiceDetail = ({ worker, isOpen, onClose, onBook }) => {
  if (!worker) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[2000] bg-white pointer-events-auto overflow-y-auto no-scrollbar"
        >
          <div className="absolute top-6 left-0 right-0 z-[2001] px-6 flex items-center justify-between pointer-events-none">
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg pointer-events-auto active:scale-90 transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-3 pointer-events-auto">
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-lg active:scale-90 transition-all">
                <FiHeart className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-lg active:scale-90 transition-all">
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-[4/5] bg-gray-50">
             <img src={worker.image} alt={worker.name} className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?w=740";
                }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
             <div className="absolute bottom-8 left-6 right-6">
                <div className="flex items-center gap-1.5 mb-1.5">
                   <div className="px-1.5 py-0.5 bg-orange-500 rounded-md text-[6px] font-black text-white uppercase tracking-widest">Top Rated</div>
                   <div className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[6px] font-black text-white uppercase tracking-widest">{worker.type}</div>
                </div>
                <h1 className="text-xl font-black text-white leading-tight">{worker.name}</h1>
             </div>
          </div>

          <div className="px-6 py-6 pb-32 bg-white rounded-t-[32px] -mt-8 relative z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.03)]">
             <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-center gap-0.5">
                   <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                      <FiStar className="w-3.5 h-3.5 fill-current" />
                   </div>
                   <p className="text-[8px] font-black text-gray-900">{worker.rating.split(' ')[0]}</p>
                   <p className="text-[6px] font-bold text-gray-400 uppercase">Rating</p>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <div className="w-9 h-9 bg-[#cfdc01]/10 rounded-xl flex items-center justify-center text-[#a2ad02] border border-[#cfdc01]/30">
                       <FiCheckCircle className="w-3.5 h-3.5" />
                    </div>
                   <p className="text-[8px] font-black text-gray-900">{worker.experience}</p>
                   <p className="text-[6px] font-bold text-gray-400 uppercase">Exp.</p>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                   <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                      <FiMessageCircle className="w-3.5 h-3.5" />
                   </div>
                   <p className="text-[8px] font-black text-gray-900">450+</p>
                   <p className="text-[6px] font-bold text-gray-400 uppercase">Jobs</p>
                </div>
             </div>

             <div className="mb-6">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2.5">About Expert</p>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                   Professional {worker.type.toLowerCase()} with over {worker.experience} of dedicated field experience. Specialized in high-precision technical work.
                </p>
             </div>

             <div className="mb-6">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Service Packages</p>
                <div className="space-y-2">
                   {['Basic Package', 'Standard Package'].map((pkg, idx) => (
                      <div key={pkg} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${idx === 0 ? 'bg-[#cfdc01]/10 border-[#cfdc01]/30' : 'bg-white border-gray-100'}`}>
                         <div>
                            <h4 className="text-[10px] font-black text-gray-900">{pkg}</h4>
                            <p className="text-[7px] font-medium text-gray-400">Complete service with warranty</p>
                         </div>
                         <p className="text-[10px] font-black text-[#a2ad02]">₹{499 + (idx * 500)}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-[2002]">
            <div className="max-w-md mx-auto flex items-center gap-3">
              <button className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 active:scale-90 transition-all">
                <FiPhone className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  onBook(worker);
                  onClose();
                }}
                className="flex-1 h-11 bg-[#cfdc01] text-[#0f172a] rounded-xl font-bold text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <FiZap className="w-3.5 h-3.5 fill-current" />
                Book Service
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const WorkersList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const searchParams = new URLSearchParams(location.search);
  const categoryTitle = searchParams.get('category') || 'Workers';

  const [selectedWorker, setSelectedWorker] = useState(null);

  const workers = useMemo(() => {
    return DUMMY_WORKERS.filter(w => 
      w.type.toLowerCase().includes(categoryTitle.toLowerCase()) || 
      categoryTitle.toLowerCase().includes(w.type.toLowerCase().slice(0, -1))
    );
  }, [categoryTitle]);

  const handleBookService = (worker) => {
    addToCart({
      id: worker.id,
      serviceId: worker.id,
      categoryId: null,
      title: `${worker.type} Booking - ${worker.name}`,
      price: 499, // default base package price
      image: worker.image,
      icon: worker.image,
      category: 'Service',
      vendorId: null
    });
    toast.success(`${worker.type} service added to cart!`);
    navigate('/user/checkout');
  };

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
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">Services</h2>
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
               placeholder={`Search ${categoryTitle}...`} 
               className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-yellow-100 shadow-sm text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cfdc01] transition-all h-[38px]"
            />
         </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto no-scrollbar">
         {workers.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
             <div className="text-4xl mb-4">👷</div>
             <p className="text-xs font-bold text-gray-500">No workers found for {categoryTitle}</p>
           </div>
         ) : (
           <div className="grid grid-cols-2 gap-3 pb-24">
              {workers.map(worker => (
                 <WorkerCard 
                    key={worker.id} 
                    {...worker} 
                    onClick={() => setSelectedWorker(worker)}
                 />
              ))}
           </div>
         )}
      </div>

      <ServiceDetail
        worker={selectedWorker}
        isOpen={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onBook={handleBookService}
      />
    </div>
  );
};

export default WorkersList;
