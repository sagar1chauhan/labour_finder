import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiMapPin, FiChevronDown, FiCompass } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import { useCity } from '../../../../context/CityContext';
import { useCart } from '../../../../context/CartContext';
import NotificationBell from '../../components/common/NotificationBell';
import LogoLoader from '../../../../components/common/LogoLoader';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const UserCategoriesPage = () => {
  const navigate = useNavigate();
  const { currentCity } = useCity();
  const { cartCount } = useCart();
  
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCatalog();
  }, [currentCity?._id]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const cityId = currentCity?._id || currentCity?.id;
      const res = await publicCatalogService.getProductsCatalog(cityId);
      if (res.success && res.catalog) {
        setCatalog(res.catalog);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter catalog based on search query
  const filteredCatalog = catalog.map(cat => {
    const matchingBrands = cat.brands.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      brands: matchingBrands
    };
  }).filter(cat => cat.brands.length > 0);

  if (loading) {
    return <LogoLoader />;
  }

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden relative" style={{ backgroundColor: '#fbfde8' }}>
      {/* Top Gradient Header */}
      <header 
        className="px-6 pt-10 pb-5 rounded-b-[32px] shadow-sm relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #d5de23 0%, #dce640 41%, #e3ec72 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
        
        {/* Navigation & Address Selector */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-gray-900 border border-white/20 shadow-sm">
              <FiMapPin className="w-4 h-4 text-green-800" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-gray-900 tracking-tight uppercase leading-none">
                  {currentCity?.name || 'Select Location'}
                </span>
                <FiChevronDown className="w-2.5 h-2.5 text-gray-900" />
              </div>
              <p className="text-[8px] font-bold text-green-900 uppercase tracking-widest opacity-80 leading-none mt-0.5">
                Serviceable Area
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div 
              onClick={() => navigate('/user/cart')} 
              className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 cursor-pointer relative active:scale-90 transition-all shadow-sm"
            >
              <FiShoppingCart className="w-4 h-4 text-green-950" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <NotificationBell navigate={navigate} />
          </div>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative z-10">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-800/70 w-3.5 h-3.5 z-20" />
          <input 
            type="text" 
            placeholder="What do you need today?" 
            className="w-full pl-10 pr-4 py-2 bg-white/95 rounded-xl border border-white/20 text-[11px] font-bold text-gray-700 h-[40px] focus:outline-none focus:ring-2 focus:ring-[#a2ad02]/30 transition-all shadow-inner" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </header>

      {/* Categories Grouped Section */}
      <main className="px-6 py-4 relative z-10 flex flex-col gap-6">
        {filteredCatalog.length > 0 ? (
          filteredCatalog.map(category => (
            <div key={category.id} className="flex flex-col gap-3">
              {/* Category Title */}
              <h2 className="text-[13px] font-black text-gray-900 tracking-tight leading-none uppercase pl-1 border-l-[3px] border-[#889400]">
                {category.title}
              </h2>
              
              {/* 4-Column Grid of Brands */}
              <div className="grid grid-cols-4 gap-x-2 gap-y-4 bg-white/40 rounded-2xl p-3 border border-white/50 backdrop-blur-sm shadow-sm">
                {category.brands.map(brand => (
                  <div 
                    key={brand.id}
                    onClick={() => navigate(`/user/categories/${category.id}/brand/${brand.id}`)}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-all group"
                  >
                    {/* Brand Card Wrapper with Sky Blue background */}
                    <div className="w-16 h-16 bg-sky-100 rounded-2xl border border-sky-200/50 flex items-center justify-center p-3 shadow-sm group-hover:border-[#cfdc01] group-hover:shadow-md transition-all overflow-hidden">
                      {brand.icon ? (
                        <img 
                          src={toAssetUrl(brand.icon)} 
                          alt={brand.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                        />
                      ) : (
                        <span className="text-lg font-black text-[#a2ad02]">{brand.title.charAt(0)}</span>
                      )}
                    </div>
                    {/* Brand Card Title */}
                    <span className="text-[9px] font-bold text-gray-800 mt-2 text-center max-w-[70px] truncate uppercase tracking-tight">
                      {brand.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiCompass className="w-12 h-12 text-gray-300 animate-pulse mb-3" />
            <p className="text-xs font-bold text-gray-400">No categories or products found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserCategoriesPage;
