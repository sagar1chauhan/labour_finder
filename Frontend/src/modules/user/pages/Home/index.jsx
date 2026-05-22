import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiZap, FiStar, FiMapPin, FiMoreHorizontal, FiShoppingBag, FiChevronRight, FiArrowLeft, FiHeart, FiShare2, FiMessageCircle, FiPhone, FiCheckCircle, FiPackage, FiFilter, FiChevronDown, FiPlus, FiX } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import userBannerService from '../../../../services/userBannerService';
import LogoLoader from '../../../../components/common/LogoLoader';
import NotificationBell from '../../components/common/NotificationBell';
import CategoryModal from './components/CategoryModal';
import SearchOverlay from './components/SearchOverlay';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import { useCity } from '../../../../context/CityContext';
import { useCart } from '../../../../context/CartContext';
import { toast } from 'react-hot-toast';
import { DUMMY_WORKERS } from '../Workers/workersData';

// --- Sub-components ---

const Header = ({ city, onLocationClick, cartCount, navigate }) => {
  const savedAddress = localStorage.getItem('currentAddress') || city?.name || 'Select Location';
  
  return (
    <div 
      className="px-4 pt-4 pb-3 fixed top-0 left-0 right-0 z-50 backdrop-blur-md overflow-hidden"
      style={{ 
        background: 'linear-gradient(180deg, rgba(213, 222, 35, 0.95) 0%, rgba(220, 230, 64, 0.95) 41%, rgba(227, 236, 114, 0.95) 69%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        height: '144px'
      }}
    >
      <div className="relative z-10 flex flex-col gap-2">
        {/* Top line with title and actions */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-gray-700 leading-tight">Delivery in</span>
            <span className="text-xl font-black text-gray-900 leading-none mb-0.5">35 Minutes</span>
            
            {/* Address selection inside left column */}
            <div 
              onClick={onLocationClick}
              className="flex items-center gap-1 cursor-pointer text-gray-800 hover:text-gray-900 transition-colors mt-0.5"
            >
              <span className="text-xs font-semibold truncate max-w-[210px]">
                {savedAddress}
              </span>
              <FiChevronDown className="w-3.5 h-3.5 text-gray-700 shrink-0" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1.5 shrink-0">
            <div 
              id="cart-icon"
              onClick={() => navigate('/user/cart')}
              className="w-8.5 h-8.5 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 cursor-pointer relative active:scale-90 transition-all shadow-sm"
            >
              <FiShoppingBag className="w-[16px] h-[16px] text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <NotificationBell navigate={navigate} />
          </div>
        </div>

        {/* Search bar below top line */}
        <div 
          onClick={() => navigate('/user/search')}
          className="relative mt-1.5 pointer-events-auto cursor-pointer group"
        >
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#889400] w-4 h-4 z-20 transition-transform duration-300 group-hover:scale-110" />
          <div className="w-full pl-11 pr-4 py-2.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl border border-white/30 text-gray-400 text-xs font-semibold tracking-wide shadow-sm flex items-center h-[42px] transition-all relative z-10">
            Search for Services (Cement, Paints...)
          </div>
        </div>
      </div>
    </div>
  );
};


const FlyingImage = ({ img }) => {
  const [style, setStyle] = useState({
    position: 'fixed',
    zIndex: 9999,
    left: img.startX,
    top: img.startY,
    width: img.width,
    height: img.height,
    pointerEvents: 'none',
    transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
    transform: 'scale(1)',
    opacity: 1,
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    objectFit: 'contain',
    backgroundColor: '#fff',
    border: '1px solid rgba(0, 0, 0, 0.05)'
  });

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setStyle(prev => ({
        ...prev,
        left: img.endX,
        top: img.endY,
        width: 30,
        height: 30,
        transform: 'scale(0.2) rotate(360deg)',
        opacity: 0.2
      }));
    });
    return () => cancelAnimationFrame(frameId);
  }, [img]);

  return <img src={img.src} style={style} alt="flying-product" />;
};

const HeroCard = ({ onAction }) => (
  <div className="px-6 py-1.5">
    <div className="relative w-full aspect-[21/10] rounded-[28px] overflow-hidden bg-gradient-to-br from-[#cfdc01] to-[#b6c200] shadow-md flex items-center">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      
      <div className="relative z-10 px-7 py-2 w-3/5">
        <span className="inline-block px-1.5 py-0.5 bg-black/10 rounded-md text-[8px] font-bold text-gray-800 tracking-wide mb-1">
          Marketplace
        </span>
        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">
          Premium <br />Services
        </h2>
        <button 
          onClick={onAction}
          className="px-4 py-1.5 bg-[#0f172a] text-white rounded-lg text-[10px] font-bold tracking-wide shadow-md active:scale-95 transition-all"
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

const DynamicBanners = ({ banners, navigate, defaultHero }) => {
  if (!banners || banners.length === 0) {
    return defaultHero;
  }

  return (
    <div className="px-6 pt-3 pb-1.5 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
      {banners.map((banner) => (
        <div
          key={banner._id}
          onClick={() => banner.link && navigate(banner.link)}
          className="relative min-w-full snap-center aspect-[21/10] rounded-[28px] overflow-hidden bg-gray-100 shadow-md flex items-center cursor-pointer active:scale-[0.99] transition-transform"
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
          
          <div className="relative z-10 px-7 py-2 w-3/5">
            <span className="inline-block px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[8px] font-bold text-white tracking-wide mb-1">
              Offer
            </span>
            <h2 className="text-lg font-bold text-white leading-tight mb-2 drop-shadow-sm line-clamp-2">
              {banner.title}
            </h2>
            {banner.link && (
              <button 
                className="px-4 py-1.5 bg-white text-gray-900 rounded-lg text-[10px] font-bold tracking-wide shadow-md active:scale-95 transition-all"
              >
                Claim Now
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const BrandServicesDrawer = ({ isOpen, onClose, brand, currentCity, navigate }) => {
  const { addToCart } = useCart();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const cityId = currentCity?._id || currentCity?.id;

  useEffect(() => {
    if (isOpen && brand?._id) {
      fetchServices();
    }
  }, [isOpen, brand?._id, cityId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await publicCatalogService.getServices({ brandId: brand._id, cityId });
      if (response.success) {
        setServices(response.services || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = async (service) => {
    try {
      const res = await addToCart({
        serviceId: service.id || service._id,
        categoryId: service.categoryId,
        title: service.title,
        price: service.discountPrice || service.basePrice,
        serviceCount: 1,
        icon: toAssetUrl(service.icon || ''),
      });
      if (res.success) {
        toast.success('Added to cart!');
        navigate('/user/cart');
      }
    } catch (err) {
      toast.error('Failed to add');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-t-[40px] max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f5faff] rounded-2xl flex items-center justify-center p-2 border border-sky-100/50 shadow-sm">
                <img src={toAssetUrl(brand.iconUrl || brand.logo)} alt={brand.title} className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  {brand.title}
                </h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Select Service
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 rounded-3xl" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <FiZap className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase">No services found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(svc => (
                  <div key={svc.id || svc._id} className="bg-white rounded-3xl p-4 border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-all">
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-black text-gray-900 mb-1">{svc.title}</h3>
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-2 leading-relaxed mb-2">{svc.description || 'Professional standard brand service'}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-600">₹{svc.discountPrice || svc.basePrice}</span>
                        {svc.discountPrice > 0 && <span className="text-[10px] text-gray-300 line-through">₹{svc.basePrice}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleServiceClick(svc)}
                      className="w-12 h-12 bg-[#cfdc01] text-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg shadow-[#cfdc01]/20 hover:shadow-[#cfdc01]/40 active:scale-90 transition-all font-black"
                    >
                      <FiPlus className="w-6 h-6 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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
                   Professional {worker.type.toLowerCase()} with over {worker.experience} of dedicated field experience. Specialized in {worker.tab.toLowerCase()} and high-precision technical work.
                </p>
             </div>

             <div className="mb-6">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Service Packages</p>
                <div className="space-y-2">
                   {['Basic Repair', 'Standard Installation'].map((pkg, idx) => (
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
          <div 
            className="sticky top-0 z-20 px-4 pt-5 pb-3.5"
            style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
          >
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                   <button 
                     onClick={onClose}
                     className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
                   >
                     <FiArrowLeft className="w-4 h-4" />
                   </button>
                   <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">Services</h2>
                      <p className="text-[10px] font-bold text-gray-800 tracking-wide leading-none mt-0.5">{category.title}</p>
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
                   placeholder={`Search ${category.title}...`} 
                   className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-yellow-100 shadow-sm text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cfdc01] transition-all h-[38px]"
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
  const { cartCount, addToCart } = useCart();

  const [flyingImages, setFlyingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [activeCategoryType, setActiveCategoryType] = useState('product'); // 'product' or 'service'

  const MANPOWER_DATA = [
    {
      id: "m1",
      title: "Engineer",
      icon: "👷‍♂️",
      subCategories: ["Architect", "Engineer", "Supervisor", "Home decor"]
    },
    {
      id: "m2",
      title: "Mason & Labour",
      icon: "🧱",
      subCategories: ["Tile fixer", "Plumber work", "Carpenter", "Electrician", "Painter", "Plaster & dismantler", "Bar Bander", "Shuttering"]
    },
    {
      id: "m3",
      title: "Contractor",
      icon: "🏗️",
      subCategories: ["Building contractor", "Renovation contractor", "Interior contractor"]
    },
    {
      id: "m4",
      title: "Vehicle Service",
      icon: "🚜",
      subCategories: ["JCB", "Tractor", "Tempo", "Eicher", "Crane", "Water Tanker"]
    },
    {
      id: "m5",
      title: "Rental Machine",
      icon: "⚙️",
      subCategories: ["Mixture", "Breaker", "Compressor"]
    }
  ];

  const SHOP_DATA = {
    "Constructor material": {
      title: "Constructor material",
      icon: "🧱",
      subCategories: ["Hardware Tool Shop", "Plywood Traders", "Cement Dealers", "Electrical Shop"]
    },
    "Safety Materials": {
      title: "Safety Materials",
      icon: "🦺",
      subCategories: ["Safety Gear Shop", "Helmet Suppliers", "Safety Shoes Store"]
    }
  };

  const handleAddToCart = (product, e) => {
    const cardEl = e?.currentTarget?.closest('.group');
    const imgEl = cardEl?.querySelector('img');
    const cartEl = document.getElementById('cart-icon');

    if (imgEl && cartEl) {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();
      
      const id = Date.now() + Math.random();
      const imageSrc = product.iconUrl || 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png';

      setFlyingImages(prev => [...prev, {
        id,
        src: imageSrc,
        startX: imgRect.left,
        startY: imgRect.top,
        width: imgRect.width,
        height: imgRect.height,
        endX: cartRect.left + (cartRect.width / 2) - 15,
        endY: cartRect.top + (cartRect.height / 2) - 15
      }]);

      setTimeout(() => {
        addToCart({
          id: product.id,
          serviceId: product.id,
          categoryId: null,
          title: product.title,
          price: product.basePrice,
          image: product.iconUrl,
          icon: product.iconUrl,
          category: 'Product',
          vendorId: null
        });
        
        cartEl.classList.add('cart-bounce');
        setTimeout(() => {
          cartEl.classList.remove('cart-bounce');
        }, 400);

        setFlyingImages(prev => prev.filter(item => item.id !== id));
        toast.success(`${product.title} added to cart!`);
      }, 800);
    } else {
      addToCart({
        id: product.id,
        serviceId: product.id,
        categoryId: null,
        title: product.title,
        price: product.basePrice,
        image: product.iconUrl,
        icon: product.iconUrl,
        category: 'Product',
        vendorId: null
      });
      toast.success(`${product.title} added to cart!`);
    }
  };

  useEffect(() => {
    const isAnyModalOpen = !!selectedWorker || isCategoryModalOpen || isSearchOpen || isAddressModalOpen || !!selectedBrand;
    window.dispatchEvent(new CustomEvent('toggle-bottom-nav', { detail: !isAnyModalOpen }));
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedWorker, isCategoryModalOpen, isSearchOpen, isAddressModalOpen, selectedBrand]);

  useEffect(() => {
    fetchData();
  }, [currentCity?._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cityId = currentCity?._id || currentCity?.id;

      // Fetch categories, home content, banners, and brands in parallel
      const [catRes, homeRes, bannerRes, brandRes] = await Promise.all([
        publicCatalogService.getCategories(cityId),
        publicCatalogService.getHomeContent(cityId),
        userBannerService.getActiveBanners().catch(err => {
          console.error("Error fetching active banners:", err);
          return { success: false, data: [] };
        }),
        publicCatalogService.getBrands({ cityId }).catch(err => {
          console.error("Error fetching brands:", err);
          return { success: false, brands: [] };
        })
      ]);

      // Prefer dedicated categories endpoint; fall back to home content categories
      if (catRes?.success && catRes.categories?.length > 0) {
        setCategories(catRes.categories);
      } else if (homeRes?.success && homeRes.categories?.length > 0) {
        setCategories(homeRes.categories);
      }

      if (bannerRes?.success && bannerRes.data?.length > 0) {
        setBanners(bannerRes.data);
      } else {
        setBanners([]);
      }

      if (brandRes?.success && brandRes.brands?.length > 0) {
        setBrands(brandRes.brands);
      } else {
        setBrands([]);
      }

      // SubCategories returned separately from brands
      if (brandRes?.success && brandRes.subCategories?.length > 0) {
        setSubCategories(brandRes.subCategories);
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (category.categoryType === 'product') {
      const isShopData = SHOP_DATA[category.title];
      if (isShopData) {
        navigate(`/user/subcategories?category=${encodeURIComponent(category.title)}&type=shop`);
      } else {
        navigate('/user/categories');
      }
    } else {
      setSelectedCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  const handleLocationSave = (houseNo, loc) => {
    if (loc?.address) {
      localStorage.setItem('currentAddress', loc.address);
      window.location.reload();
    }
    setIsAddressModalOpen(false);
  };

  const DUMMY_PRODUCTS_BY_CATEGORY = [
    {
      categoryName: "Cement & Plaster",
      products: [
        {
          id: "p1",
          title: "UltraTech PPC Cement (50 kg)",
          basePrice: 385,
          discountPrice: 390,
          unit: "bag",
          stockWarning: "Only 5 left",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p2",
          title: "Birla White Cement (50 kg)",
          basePrice: 1155,
          discountPrice: 1250,
          unit: "bag",
          stockWarning: "Limited stock",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p3",
          title: "Saint Gobain Gyproc Xpert+ Gypsum Plaster (20 kg)",
          basePrice: 270,
          discountPrice: 350,
          unit: "bag",
          stockWarning: "Only 5 left",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p4",
          title: "Saint Gobain Gyproc Plain Gypsum Board (12.5 mm, 4 x 6 feet)",
          basePrice: 580,
          discountPrice: 580,
          unit: "piece",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p5",
          title: "JK Super Strong Cement (50 kg)",
          basePrice: 375,
          discountPrice: 395,
          unit: "bag",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p6",
          title: "Ambuja Kawach Waterproof Cement (50 kg)",
          basePrice: 440,
          discountPrice: 480,
          unit: "bag",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        }
      ]
    },
    {
      categoryName: "Tiling",
      products: [
        {
          id: "p7",
          title: "MYK Laticrete 305 Tiles Adhesive Grey (20 kg)",
          basePrice: 335,
          discountPrice: 506,
          unit: "bag",
          stockWarning: "Only 5 left",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p8",
          title: "MYK Laticrete 335 Super Flex Tile Adhesive (20 kg, White)",
          basePrice: 1460,
          discountPrice: 1810,
          unit: "bag",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p9",
          title: "MYK Laticrete 325 High Flex Polymer Modified Tile Adhesive (20 kg)",
          basePrice: 1060,
          discountPrice: 1290,
          unit: "bag",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p10",
          title: "Pidilite Roff Tile Grout (1 kg, Ivory)",
          basePrice: 140,
          discountPrice: 160,
          unit: "bag",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p11",
          title: "Bal Endura Tile Adhesive (20 kg)",
          basePrice: 290,
          discountPrice: 340,
          unit: "bag",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        },
        {
          id: "p12",
          title: "Dr. Fixit Pidiproof LW+ (1 Litre)",
          basePrice: 165,
          discountPrice: 195,
          unit: "piece",
          iconUrl: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
        }
      ]
    }
  ];


  const productCategories = useMemo(() => {
    return categories.filter(cat => {
      const type = cat.categoryType || 'service';
      return type === 'product';
    });
  }, [categories]);

  const serviceCategories = useMemo(() => {
    return categories.filter(cat => {
      const type = cat.categoryType || 'service';
      return type === 'service';
    });
  }, [categories]);

  const categoryWorkers = useMemo(() => {
    if (!selectedCategory) return [];
    return DUMMY_WORKERS.filter(w => w.type.toLowerCase().includes(selectedCategory.title.toLowerCase()) || selectedCategory.title.toLowerCase().includes(w.type.toLowerCase().slice(0, -1)));
  }, [selectedCategory]);

  const handleBookService = (worker) => {
    toast.success(`${worker.name} booked successfully!`);
  };

  if (loading && categories.length === 0) return <LogoLoader />;

  return (
    <div className="overflow-x-hidden relative min-h-screen" style={{ backgroundColor: '#fbfde8' }}>
      <div className="relative z-10 pt-[144px]">
        <Header 
          city={currentCity} 
          onLocationClick={() => setIsAddressModalOpen(true)}
          cartCount={cartCount}
          navigate={navigate}
        />
        
        <DynamicBanners 
          banners={banners} 
          navigate={navigate} 
          defaultHero={<HeroCard onAction={() => navigate('/user/categories')} />} 
        />
        
        {/* Manpower Categories Section */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex flex-col mb-5 items-start">
            <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">Manpower</h3>
            <p className="text-[10px] font-bold text-gray-500 italic mt-0.5">"Skilled workers on demand"</p>
          </div>

          <div className="grid grid-cols-4 gap-x-3 gap-y-4">
            {MANPOWER_DATA.map(cat => (
              <div
                key={cat.id}
                onClick={() => navigate(`/user/subcategories?category=${encodeURIComponent(cat.title)}&type=worker`)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-full aspect-square bg-[#f5faff] hover:bg-[#e6f2ff] rounded-2xl flex items-center justify-center border border-sky-100/30 group-active:scale-95 transition-all overflow-hidden p-3.5 text-2xl relative shadow-sm">
                  <span className="relative z-10">{cat.icon}</span>
                </div>
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-2 max-w-[72px]">{cat.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services Categories Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">Services</h3>
          </div>

          {/* Skeleton while loading */}
          {loading ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="h-3 w-12 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : serviceCategories.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-4">
              {serviceCategories.map(cat => (
                <div
                  key={cat._id || cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-full aspect-square bg-[#f5faff] hover:bg-[#e6f2ff] rounded-2xl flex items-center justify-center border border-sky-100/30 group-active:scale-95 transition-all overflow-hidden p-3.5 text-2xl relative shadow-sm">
                    {cat.icon?.length > 2 ? (
                      <img src={cat.icon || cat.image} alt={cat.title} className="w-full h-full object-contain relative z-10" />
                    ) : (
                      <span className="relative z-10">{cat.icon || '🛠️'}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-2 max-w-[72px]">{cat.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No services available</p>
          )}
        </div>

        {/* Products Categories Section */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">Shop Products</h3>
          </div>

          {/* Skeleton while loading */}
          {loading ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="h-3 w-12 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : productCategories.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-4">
              {productCategories.map(cat => (
                <div
                  key={cat._id || cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-full aspect-square bg-[#f5faff] hover:bg-[#e6f2ff] rounded-2xl flex items-center justify-center border border-sky-100/30 group-active:scale-95 transition-all overflow-hidden p-3.5 text-2xl relative shadow-sm">
                    {cat.icon?.length > 2 ? (
                      <img src={cat.icon || cat.image} alt={cat.title} className="w-full h-full object-contain relative z-10" />
                    ) : (
                      <span className="relative z-10">{cat.icon || '📦'}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-2 max-w-[72px]">{cat.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No products available</p>
          )}
        </div>

        {/* Shop by Brands Section */}
        {brands.length > 0 && (
          <div className="px-6 py-3 mb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Shop by Brands</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-4 gap-x-2 gap-y-4 py-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex flex-col items-center animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                    <div className="h-2 w-10 bg-gray-200 rounded-full mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-x-2 gap-y-4 pb-2">
                {brands.map(brand => (
                  <div 
                    key={brand.id || brand._id}
                    onClick={() => setSelectedBrand(brand)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-all group"
                  >
                    <div className="w-16 h-16 bg-sky-100 rounded-2xl border border-sky-200/50 flex items-center justify-center p-3 shadow-sm group-hover:border-[#cfdc01] group-hover:shadow-md transition-all overflow-hidden">
                      {brand.icon || brand.logo ? (
                        <img src={brand.icon || brand.logo} alt={brand.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-xl font-bold text-gray-400">{brand.title.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-gray-800 mt-2 text-center max-w-[70px] truncate uppercase tracking-tight">{brand.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Products Showcase Section */}
        {DUMMY_PRODUCTS_BY_CATEGORY.map((catGroup) => (
          <div key={catGroup.categoryName} className="px-6 py-4 border-t border-black/[0.03] mt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 border-l-[3px] border-[#a2ad02] pl-2">
                <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase">
                  {catGroup.categoryName}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {catGroup.products.slice(0, 4).map((product) => {
                const base = product.basePrice || 0;
                const discount = product.discountPrice || 0;
                const hasDiscount = discount > base;
                const discountPercent = hasDiscount 
                  ? Math.round(((discount - base) / discount) * 100)
                  : 0;

                return (
                  <div 
                    key={product.id}
                    onClick={() => navigate('/user/categories')}
                    className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all duration-300 relative group cursor-pointer"
                  >
                    {/* Image Box */}
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 flex items-center justify-center p-1.5 relative">
                      <img 
                        src={product.iconUrl} 
                        alt={product.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      />
                      
                      {/* ADD Button */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAddToCart(product, e);
                        }}
                        className="absolute bottom-1 right-1 px-2.5 py-0.5 bg-white border border-[#a2ad02] text-[#a2ad02] hover:bg-[#a2ad02] hover:text-white rounded-lg text-[8px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                      >
                        ADD
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-[10px] font-semibold text-gray-800 leading-tight mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      
                      {/* Stock warning */}
                      {product.stockWarning && (
                        <p className="text-[8px] font-bold text-amber-600 mb-1">
                          {product.stockWarning}
                        </p>
                      )}

                      {/* Pricing row */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                        <span className="text-[11px] font-black text-gray-900">
                          ₹{base}{product.unit ? <span className="text-[8px] font-semibold text-gray-500">/{product.unit}</span> : ''}
                        </span>
                        {hasDiscount && (
                          <span className="text-[9px] font-semibold text-gray-400 line-through">
                            ₹{discount}
                          </span>
                        )}
                      </div>
                      
                      {/* Discount Text */}
                      {hasDiscount && (
                        <p className="text-[9px] font-bold text-green-700 mt-0.5">
                          {discountPercent}% OFF
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* See All Button directly below the 4 products */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => navigate('/user/categories')}
                className="w-full py-3 bg-white border border-[#a2ad02]/30 text-[#a2ad02] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-[#a2ad02] hover:text-white transition-all active:scale-95 text-center"
              >
                See All {catGroup.categoryName}
              </button>
            </div>
          </div>
        ))}



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

        <BrandServicesDrawer
          isOpen={!!selectedBrand}
          onClose={() => setSelectedBrand(null)}
          brand={selectedBrand}
          currentCity={currentCity}
          navigate={navigate}
        />

        {/* Fly-to-Cart Flying Previews */}
        {flyingImages.map(img => (
          <FlyingImage key={img.id} img={img} />
        ))}
        
      </div>
    </div>
  );
};

export default Home;
