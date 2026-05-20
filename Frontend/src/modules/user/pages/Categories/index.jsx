import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiMapPin, FiChevronDown, FiCompass, FiPackage, FiTool } from 'react-icons/fi';
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

  const [productCatalog, setProductCatalog] = useState([]);   // Sub-categories / Products
  const [serviceCatalog, setServiceCatalog] = useState([]);   // Service brands
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');     // 'products' | 'services'

  useEffect(() => {
    fetchData();
  }, [currentCity?._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cityId = currentCity?._id || currentCity?.id;

      const [productRes, serviceRes] = await Promise.all([
        publicCatalogService.getProductsCatalog(cityId),
        publicCatalogService.getBrands({ cityId }).catch(() => ({ success: false, brands: [] }))
      ]);

      // Products catalog (sub-categories grouped under parent categories)
      if (productRes?.success && productRes.catalog) {
        setProductCatalog(productRes.catalog.filter(c => c.brands?.length > 0));
      }

      // Services catalog (flat list of service brands grouped by category)
      if (serviceRes?.success && serviceRes.brands) {
        // Group service brands by their categoryId
        const serviceGroupMap = new Map();
        serviceRes.brands.forEach(brand => {
          const catId = brand.categoryId || 'other';
          const catTitle = brand.categoryTitle || 'Other Services';
          if (!serviceGroupMap.has(catId)) {
            serviceGroupMap.set(catId, { id: catId, title: catTitle, brands: [] });
          }
          serviceGroupMap.get(catId).brands.push(brand);
        });
        setServiceCatalog(Array.from(serviceGroupMap.values()));
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Current data based on active tab
  const currentCatalog = activeTab === 'products' ? productCatalog : serviceCatalog;

  // Filter based on search
  const filteredCatalog = currentCatalog.map(cat => ({
    ...cat,
    brands: cat.brands.filter(b =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.brands.length > 0);

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen pb-24 relative" style={{ backgroundColor: '#fbfde8' }}>

      {/* Top Gradient Header */}
      <header
        className="px-4 pt-5 pb-3.5 rounded-b-[24px] shadow-sm relative overflow-hidden sticky top-0 z-50"
        style={{ background: 'linear-gradient(180deg, #d5de23 0%, #dce640 41%, #e3ec72 100%)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />

        {/* Nav row */}
        <div className="flex items-center justify-between mb-3.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
              <FiMapPin className="w-3.5 h-3.5 text-green-800" />
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

          <div className="flex items-center gap-2">
            <div
              onClick={() => navigate('/user/cart')}
              className="w-7.5 h-7.5 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 cursor-pointer relative active:scale-90 transition-all shadow-sm"
            >
              <FiShoppingCart className="w-3.5 h-3.5 text-green-950" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <NotificationBell navigate={navigate} />
          </div>
        </div>

        {/* Search Box */}
        <div className="relative z-10 mb-3">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800/70 w-3.5 h-3.5 z-20" />
          <input
            type="text"
            placeholder="What do you need today?"
            className="w-full pl-9 pr-4 py-1.5 bg-white/95 rounded-xl border border-white/20 text-[10px] font-bold text-gray-700 h-[36px] focus:outline-none focus:ring-2 focus:ring-[#a2ad02]/30 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products / Services Toggle */}
        <div className="relative z-10 flex items-center bg-black/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all active:scale-95 ${
              activeTab === 'products'
                ? 'bg-[#0f172a] text-[#cfdc01] shadow-md'
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            <FiPackage className="w-3.5 h-3.5" />
            Products
          </button>
          <button
            onClick={() => { setActiveTab('services'); setSearchQuery(''); }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all active:scale-95 ${
              activeTab === 'services'
                ? 'bg-[#0f172a] text-[#cfdc01] shadow-md'
                : 'text-gray-700 hover:bg-white/20'
            }`}
          >
            <FiTool className="w-3.5 h-3.5" />
            Services
          </button>
        </div>
      </header>

      {/* Catalog Section */}
      <main className="px-6 py-4 relative z-10 flex flex-col gap-6">
        {filteredCatalog.length > 0 ? (
          filteredCatalog.map(category => (
            <div key={category.id} className="flex flex-col gap-3">
              {/* Category Title */}
              <h2 className="text-[13px] font-black text-gray-900 tracking-tight leading-none uppercase pl-1 border-l-[3px] border-[#889400]">
                {category.title}
              </h2>

              {/* 4-Column Grid */}
              <div className="grid grid-cols-4 gap-x-2 gap-y-5 mt-2">
                {category.brands.map(brand => (
                  <div
                    key={brand.id || brand._id}
                    onClick={() => {
                      if (activeTab === 'products') {
                        if (brand.type === 'subcategory') {
                          navigate(`/user/catalog/brand/${brand.id}?slug=${brand.slug}`);
                        } else {
                          navigate(`/user/categories/${category.id}/brand/${brand.id}`);
                        }
                      } else {
                        // Services — navigate to brand detail
                        navigate(`/user/catalog/brand/${brand.id || brand._id}?slug=${brand.slug}`);
                      }
                    }}
                    className="flex flex-col items-center cursor-pointer active:scale-95 transition-all group"
                  >
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center p-3 shadow-sm group-hover:border-[#cfdc01] group-hover:shadow-md transition-all overflow-hidden ${
                      activeTab === 'products'
                        ? 'bg-sky-50 border-sky-100'
                        : 'bg-amber-50 border-amber-100'
                    }`}>
                      {(brand.icon || brand.logo || brand.iconUrl) ? (
                        <img
                          src={toAssetUrl(brand.icon || brand.logo || brand.iconUrl)}
                          alt={brand.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-lg font-black text-[#a2ad02]">{brand.title.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-gray-800 mt-2 text-center max-w-[70px] truncate uppercase tracking-tight">
                      {brand.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiCompass className="w-12 h-12 text-gray-300 animate-pulse mb-3" />
            <p className="text-xs font-black text-gray-400">
              No {activeTab === 'products' ? 'products' : 'services'} found.
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              {searchQuery ? 'Try a different search term' : 'Check back later'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserCategoriesPage;
