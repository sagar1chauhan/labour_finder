import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiZap, FiStar, FiMapPin, FiMoreHorizontal, FiShoppingBag, FiChevronRight, FiArrowLeft, FiHeart, FiShare2, FiMessageCircle, FiPhone, FiCheckCircle, FiPackage, FiFilter, FiChevronDown } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import LogoLoader from '../../../../components/common/LogoLoader';
import NotificationBell from '../../components/common/NotificationBell';
import CategoryModal from './components/CategoryModal';
import SearchOverlay from './components/SearchOverlay';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import { useCity } from '../../../../context/CityContext';
import { useCart } from '../../../../context/CartContext';
import { toast } from 'react-hot-toast';

// --- Sub-components ---

const Header = ({ city, onLocationClick, cartCount, navigate }) => (
  <div className="bg-[#0D9488] px-6 pt-10 pb-5 rounded-b-[32px] shadow-lg shadow-teal-900/20 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-16 -translate-x-16" />
    
    <div className="relative z-10 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div 
          onClick={onLocationClick}
          className="flex flex-col cursor-pointer group"
        >
          <p className="text-[8px] font-bold text-teal-100 uppercase tracking-[0.2em] leading-none mb-1 opacity-80">Location</p>
          <div className="flex items-center gap-1 text-[12px] font-black text-white">
            <FiMapPin className="w-3.5 h-3.5 text-orange-300" />
            <span>{city?.name || 'New York, USA'}</span>
            <FiChevronDown className="w-3.5 h-3.5 text-teal-200" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => navigate('/user/cart')}
            className="w-9 h-9 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 cursor-pointer relative active:scale-90 transition-all"
          >
            <FiShoppingBag className="w-4 h-4 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-[#0D9488]">
                {cartCount}
              </span>
            )}
          </div>
          <NotificationBell light />
        </div>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 w-3.5 h-3.5" />
        <input 
          type="text" 
          placeholder="Search for services..." 
          className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-inner border-none text-[11px] font-bold text-gray-700 placeholder:text-gray-400 h-[40px]"
          onClick={() => navigate('/user/shop')}
        />
      </div>
    </div>
  </div>
);

const FilterPills = ({ active, onChange }) => {
  const filters = ['All', 'Booked', 'Electricians', 'Plumbers', 'Electronics', 'Cleaning'];
  return (
    <div className="px-6 py-3 flex gap-1.5 overflow-x-auto no-scrollbar">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all whitespace-nowrap uppercase ${active === filter 
            ? 'bg-[#0D9488] text-white shadow-md' 
            : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

const HeroCard = ({ onAction }) => (
  <div className="px-6 py-1.5">
    <div className="relative w-full aspect-[21/8] rounded-[28px] overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-50 flex items-center">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      
      <div className="relative z-10 px-7 py-2 w-3/5">
        <span className="inline-block px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[7px] font-black text-white uppercase tracking-widest mb-1">
          Marketplace
        </span>
        <h2 className="text-lg font-black text-white leading-tight mb-2">
          Premium <br />Services
        </h2>
        <button 
          onClick={onAction}
          className="px-4 py-1.5 bg-white text-teal-600 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Explore
        </button>
      </div>

      <div className="absolute right-0 bottom-0 w-2/5 h-full flex items-end">
        <img 
          src="https://img.freepik.com/free-vector/electrician-working-with-tools-illustrated_23-2148404281.jpg?w=740" 
          alt="Service Man" 
          className="w-full h-full object-contain object-bottom drop-shadow-2xl brightness-110 contrast-110 scale-110 translate-y-2"
        />
      </div>
    </div>
  </div>
);

const WorkerCard = ({ name, rating, experience, image, onClick }) => (
  <div 
    onClick={onClick}
    className="min-w-[120px] bg-white rounded-[20px] p-2 shadow-sm border border-gray-50 mr-2.5 group active:scale-[0.98] transition-all cursor-pointer"
  >
    <div className="relative w-full aspect-square rounded-[16px] overflow-hidden mb-2 bg-gray-50">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
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
             <img src={worker.image} alt={worker.name} className="w-full h-full object-cover" />
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
                   <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 border border-teal-100">
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
                   Professional {worker.type.toLowerCase()} with over {worker.experience} of dedicated field experience. Specialized in {worker.tab.toLowerCase()} and high-precision technical work.
                </p>
             </div>

             <div className="mb-6">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Service Packages</p>
                <div className="space-y-2">
                   {['Basic Repair', 'Standard Installation'].map((pkg, idx) => (
                      <div key={pkg} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${idx === 0 ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'}`}>
                         <div>
                            <h4 className="text-[10px] font-black text-gray-900">{pkg}</h4>
                            <p className="text-[7px] font-medium text-gray-400">Complete service with warranty</p>
                         </div>
                         <p className="text-[10px] font-black text-teal-600">₹{499 + (idx * 500)}</p>
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
                className="flex-1 h-11 bg-[#0D9488] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-teal-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
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

const CategoryResultsView = ({ category, isOpen, onClose, workers, onWorkerClick }) => {
  if (!category) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[2000] bg-gray-50 pointer-events-auto overflow-y-auto no-scrollbar"
        >
          <div className="sticky top-0 z-20 bg-[#0D9488] px-6 pt-10 pb-5 rounded-b-[32px] shadow-lg shadow-teal-900/20">
             <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                   <button 
                     onClick={onClose}
                     className="w-8 h-8 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
                   >
                     <FiArrowLeft className="w-4 h-4" />
                   </button>
                   <div>
                      <h2 className="text-base font-black text-white tracking-tight uppercase">Services</h2>
                      <p className="text-[8px] font-bold text-teal-100 uppercase tracking-[0.2em] opacity-80 leading-none mt-0.5">{category.title}</p>
                   </div>
                </div>
                <button className="w-8 h-8 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10">
                   <FiFilter className="w-4 h-4" />
                </button>
             </div>
             
             <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 w-3.5 h-3.5" />
                <input 
                   type="text" 
                   placeholder={`Search ${category.title}...`} 
                   className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border-none text-[11px] font-bold text-gray-700 h-[40px]"
                />
             </div>
          </div>

          <div className="px-6 py-6">
             <div className="grid grid-cols-2 gap-3">
                {workers.map(worker => (
                   <WorkerCard 
                      key={worker.id} 
                      {...worker} 
                      onClick={() => onWorkerClick(worker)}
                   />
                ))}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Page ---

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCity } = useCity();
  const { cartCount } = useCart();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeServiceTab, setActiveServiceTab] = useState('Repairing');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    const isAnyModalOpen = !!selectedWorker || isCategoryModalOpen || isSearchOpen || isAddressModalOpen;
    window.dispatchEvent(new CustomEvent('toggle-bottom-nav', { detail: !isAnyModalOpen }));
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedWorker, isCategoryModalOpen, isSearchOpen, isAddressModalOpen]);

  useEffect(() => {
    fetchData();
  }, [currentCity?._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cityId = currentCity?._id || currentCity?.id;
      const res = await publicCatalogService.getHomeContent(cityId);
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleLocationSave = (houseNo, loc) => {
    if (loc?.address) {
      localStorage.setItem('currentAddress', loc.address);
      window.location.reload();
    }
    setIsAddressModalOpen(false);
  };

  const DUMMY_WORKERS = [
    { id: 1, name: "James Carter", rating: "4.9 (200)", experience: "8 years", type: "Electricians", tab: "Repairing", image: "https://img.freepik.com/free-photo/portrait-smiley-man-working-as-delivery-person_23-2148911520.jpg?w=740" },
    { id: 2, name: "Ethan Brooks", rating: "4.8 (150)", experience: "10 years", type: "Plumbers", tab: "Installation", image: "https://img.freepik.com/free-photo/plumber-ready-work_23-2147744158.jpg?w=740" },
    { id: 3, name: "Sarah Miller", rating: "4.7 (120)", experience: "5 years", type: "Cleaning", tab: "Repairing", image: "https://img.freepik.com/free-photo/woman-cleaning-house_23-2148222320.jpg?w=740" },
    { id: 4, name: "David Wilson", rating: "4.9 (310)", experience: "12 years", type: "Electricians", tab: "Rewiring", image: "https://img.freepik.com/free-photo/electrician-working-house_23-2148404281.jpg?w=740" },
  ];

  const filteredWorkers = DUMMY_WORKERS.filter(worker => {
    const matchesFilter = activeFilter === 'All' || activeFilter === 'Booked' || worker.type === activeFilter;
    const matchesTab = worker.tab === activeServiceTab;
    return matchesFilter && matchesTab;
  });

  const displayWorkers = filteredWorkers.length > 0 ? filteredWorkers : DUMMY_WORKERS;

  const displayCategories = categories.length > 0 ? categories : [
    { id: 'c1', title: 'Electrician', icon: '⚡' },
    { id: 'c2', title: 'Plumber', icon: '🚰' },
    { id: 'c3', title: 'Cleaning', icon: '🧹' },
    { id: 'c4', title: 'AC Repair', icon: '❄️' },
  ];

  const categoryWorkers = useMemo(() => {
    if (!selectedCategory) return [];
    return DUMMY_WORKERS.filter(w => w.type.toLowerCase().includes(selectedCategory.title.toLowerCase()) || selectedCategory.title.toLowerCase().includes(w.type.toLowerCase().slice(0, -1)));
  }, [selectedCategory]);

  const handleBookService = (worker) => {
    toast.success(`${worker.name} booked successfully!`);
  };

  if (loading && categories.length === 0) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden relative">
      <div className="relative z-10">
        <Header 
          city={currentCity} 
          onLocationClick={() => setIsAddressModalOpen(true)}
          cartCount={cartCount}
          navigate={navigate}
        />
        
        <FilterPills active={activeFilter} onChange={setActiveFilter} />
        
        <HeroCard onAction={() => navigate('/user/shop')} />

        {/* Categories Section (Moved up for prominent, high-converting premium visibility) */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Categories</h3>
            <button onClick={() => navigate('/user/shop')} className="text-[8px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-lg">See All</button>
          </div>
          <div className="grid grid-cols-4 gap-x-3 gap-y-4">
            {displayCategories.map(cat => (
              <div 
                key={cat._id || cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-[52px] h-[52px] bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-active:scale-90 transition-all overflow-hidden p-3 text-lg relative">
                  <div className="absolute inset-0 bg-teal-50/0 group-hover:bg-teal-50/50 transition-colors" />
                  {cat.icon?.length > 2 ? (
                    <img src={cat.icon || cat.image} alt={cat.title} className="w-full h-full object-contain relative z-10" />
                  ) : (
                    <span className="relative z-10">{cat.icon || '🛠️'}</span>
                  )}
                </div>
                <span className="text-[8px] font-bold text-gray-600 text-center leading-tight uppercase tracking-tighter line-clamp-1">{cat.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Our Services Section */}
        <div className="px-6 py-3 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-gray-900 tracking-tight">Our Services</h2>
            <button className="text-[8px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-lg">View All</button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {['Repairing', 'Installation'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveServiceTab(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeServiceTab === tab 
                  ? 'bg-[#0D9488] text-white shadow-md' 
                  : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {displayWorkers.map(worker => (
              <WorkerCard 
                key={worker.id} 
                {...worker} 
                onClick={() => setSelectedWorker(worker)}
              />
            ))}
          </div>
        </div>

        <ServiceDetail
          worker={selectedWorker}
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onBook={handleBookService}
        />

        <CategoryResultsView
           category={selectedCategory}
           isOpen={isCategoryModalOpen}
           onClose={() => setIsCategoryModalOpen(false)}
           workers={categoryWorkers}
           onWorkerClick={(w) => {
              setIsCategoryModalOpen(false);
              setSelectedWorker(w);
           }}
        />

        <SearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />

        <AddressSelectionModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={handleLocationSave}
        />
      </div>
    </div>
  );
};

export default Home;
