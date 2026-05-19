import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FiX, FiLayers, FiArrowLeft, FiPlus, FiCheck, FiInfo, FiShield, FiMapPin, FiStar, FiUser, FiCheckCircle, FiZap } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { themeColors } from '../../../../../theme';
import { publicCatalogService } from '../../../../../services/catalogService';
import { useCart } from '../../../../../context/CartContext';
import { toast } from 'react-hot-toast';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const VendorInfoModal = ({ isOpen, onClose, vendor }) => {
  if (!isOpen || !vendor) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="h-24 bg-gradient-to-r from-amber-400 to-orange-500 relative">
             <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
             >
               <FiX className="w-5 h-5" />
             </button>
          </div>

          <div className="px-6 pb-8 -mt-12 relative text-center">
            <div className="inline-block p-1.5 bg-white rounded-full shadow-lg mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white">
                {vendor.profilePhoto ? (
                  <img src={toAssetUrl(vendor.profilePhoto)} alt={vendor.businessName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50">
                    <FiUser className="w-10 h-10 text-amber-300" />
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-1">{vendor.businessName || vendor.name}</h3>
            
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                <FiShield className="w-3.5 h-3.5" />
                VERIFIED PROFESSIONAL
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                  <FiStar className="w-4 h-4 fill-current" />
                  <span className="font-black text-lg">{vendor.rating || '4.8'}</span>
                </div>
                <p className="text-[9px] text-gray-400 font-black uppercase">Rating</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="font-black text-lg text-orange-600 mb-0.5">{vendor.totalJobs || '50'}+</div>
                <p className="text-[9px] text-gray-400 font-black uppercase">Jobs Done</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-4 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-gray-200 active:scale-95 transition-all"
            >
              Close Info
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BrandCard = ({ brand, onClick }) => (
  <div
    onClick={() => onClick(brand)}
    className="flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
  >
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-gray-50 group-hover:border-amber-200 overflow-hidden p-3 transition-all">
      {brand.icon ? (
        <img
          src={toAssetUrl(brand.icon)}
          alt={brand.title}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
        />
      ) : (
        <FiZap className="w-6 h-6 text-amber-300 fill-current" />
      )}
    </div>
    <p className="text-[9px] font-black text-gray-800 text-center leading-tight line-clamp-1 px-1 uppercase tracking-tighter">
      {brand.title}
    </p>
    <span className="text-[8px] font-black text-amber-600 mt-1">₹{brand.price || 0}+</span>
  </div>
);

const CategoryModal = React.memo(({ isOpen, onClose, category, currentCity }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [view, setView] = useState('brands');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const cityId = currentCity?._id || currentCity?.id;

  useEffect(() => {
    if (isOpen && category?.id) {
      fetchBrands();
    }
  }, [isOpen, category?.id, cityId]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await publicCatalogService.getBrands({ categoryId: category.id, cityId });
      if (response.success) setBrands(response.brands || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchServices = async (brandId) => {
    try {
      setLoading(true);
      const response = await publicCatalogService.getServices({ brandId, cityId, categoryId: category?.id });
      if (response.success) setServices(response.services || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    setView('services');
    fetchServices(brand.id || brand._id);
  };

  const handleServiceClick = async (service) => {
    try {
      const res = await addToCart({
        serviceId: service.id || service._id,
        categoryId: category?.id,
        title: service.title,
        price: service.discountPrice || service.basePrice,
        serviceCount: 1,
        icon: toAssetUrl(service.icon || ''),
      });
      if (res.success) {
        toast.success('Added to cart!');
        navigate('/user/cart');
      }
    } catch (err) { toast.error('Failed to add'); }
  };

  if (!isOpen) return null;

  return createPortal(
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
              {view === 'services' && (
                <button onClick={() => setView('brands')} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                  <FiArrowLeft className="w-4 h-4 text-gray-800" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  {view === 'brands' ? category?.title : selectedBrand?.title}
                </h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {view === 'brands' ? 'Choose a sub-category' : 'Select Service'}
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
              <div className="grid grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-2xl" />
                ))}
              </div>
            ) : (
              view === 'brands' ? (
                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                  {brands.map(brand => (
                    <BrandCard key={brand.id || brand._id} brand={brand} onClick={handleBrandClick} />
                  ))}
                  {brands.length === 0 && (
                    <div className="col-span-4 py-20 text-center opacity-30">
                      <FiZap className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-xs font-black uppercase">No items found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map(svc => (
                    <div key={svc.id || svc._id} className="bg-white rounded-3xl p-4 border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-all">
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-gray-900 mb-1">{svc.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-amber-600">₹{svc.discountPrice || svc.basePrice}</span>
                          {svc.discountPrice && <span className="text-[10px] text-gray-300 line-through">₹{svc.basePrice}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleServiceClick(svc)}
                        className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 active:scale-90 transition-all"
                      >
                        <FiPlus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>

      <VendorInfoModal 
        isOpen={isVendorModalOpen} 
        onClose={() => setIsVendorModalOpen(false)} 
        vendor={selectedVendor} 
      />
    </AnimatePresence>,
    document.body
  );
});

export default CategoryModal;
