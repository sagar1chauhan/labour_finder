import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiMapPin, FiChevronDown, FiCompass, FiPackage, FiTool, FiHeart, FiUser } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import { useCity } from '../../../../context/CityContext';
import { useCart } from '../../../../context/CartContext';
import NotificationBell from '../../components/common/NotificationBell';
import LogoLoader from '../../../../components/common/LogoLoader';
import CategoryModal from '../Home/components/CategoryModal';
import { toast } from 'react-hot-toast';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const MANPOWER_DATA = [
  { id: "m1", title: "Engineer", icon: "👷‍♂️", categoryType: "manpower" },
  { id: "m2", title: "Mason & Labour", icon: "🧱", categoryType: "manpower" },
  { id: "m3", title: "Contractor", icon: "🏗️", categoryType: "manpower" },
  { id: "m4", title: "Vehicle Service", icon: "🚜", categoryType: "manpower" },
  { id: "m5", title: "Rental Machine", icon: "⚙️", categoryType: "manpower" }
];

const UserCategoriesPage = () => {
  const navigate = useNavigate();
  const { currentCity } = useCity();
  const { cartCount } = useCart();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shortlisted_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentCity?._id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cityId = currentCity?._id || currentCity?.id;
      const catRes = await publicCatalogService.getCategories(cityId);
      if (catRes?.success && catRes.categories) {
        setCategories(catRes.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleShortlist = (cat) => {
    const id = cat.id;
    setShortlistedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('shortlisted_categories', JSON.stringify(next));
      if (prev.includes(id)) {
        toast.success(`Removed ${cat.title} from shortlist`);
      } else {
        toast.success(`Added ${cat.title} to shortlist!`);
      }
      return next;
    });
  };

  const mappedProductCategories = useMemo(() => {
    return categories
      .filter(cat => (cat.categoryType || 'service') === 'product')
      .map(cat => ({
        id: cat._id || cat.id,
        title: cat.title,
        icon: cat.icon || cat.image,
        categoryType: 'product',
        original: cat
      }));
  }, [categories]);

  const mappedServiceCategories = useMemo(() => {
    return categories
      .filter(cat => (cat.categoryType || 'service') === 'service')
      .map(cat => ({
        id: cat._id || cat.id,
        title: cat.title,
        icon: cat.icon || cat.image,
        categoryType: 'service',
        original: cat
      }));
  }, [categories]);

  const mappedManpowerCategories = useMemo(() => {
    return MANPOWER_DATA.map(cat => ({
      id: cat.id,
      title: cat.title,
      icon: cat.icon,
      categoryType: 'manpower',
      original: cat
    }));
  }, []);

  const allMappedCategories = useMemo(() => {
    return [
      ...mappedManpowerCategories,
      ...mappedProductCategories,
      ...mappedServiceCategories
    ];
  }, [mappedManpowerCategories, mappedProductCategories, mappedServiceCategories]);

  // Filter all categories by search query first
  const searchedCategories = useMemo(() => {
    if (!searchQuery) return allMappedCategories;
    return allMappedCategories.filter(cat =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMappedCategories, searchQuery]);

  // Then split by activeTab
  const displayedManpower = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'manpower') return [];
    return searchedCategories.filter(cat => cat.categoryType === 'manpower');
  }, [searchedCategories, activeTab]);

  const displayedProducts = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'products') return [];
    return searchedCategories.filter(cat => cat.categoryType === 'product');
  }, [searchedCategories, activeTab]);

  const displayedServices = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'services') return [];
    return searchedCategories.filter(cat => cat.categoryType === 'service');
  }, [searchedCategories, activeTab]);

  const displayedShortlisted = useMemo(() => {
    if (activeTab !== 'shortlisted') return [];
    return searchedCategories.filter(cat => shortlistedIds.includes(cat.id));
  }, [searchedCategories, activeTab, shortlistedIds]);

  const handleCategoryClick = (category) => {
    if (category.categoryType === 'manpower') {
      navigate(`/user/subcategories?category=${encodeURIComponent(category.title)}&type=worker`);
    } else if (category.categoryType === 'product') {
      navigate(`/user/subcategories?category=${encodeURIComponent(category.title)}&type=shop`);
    } else if (category.categoryType === 'service') {
      setSelectedCategory(category.original);
      setIsCategoryModalOpen(true);
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'manpower': return 'Manpower';
      case 'products': return 'Shop Products';
      case 'services': return 'Services';
      case 'shortlisted': return 'Shortlisted';
      default: return '';
    }
  };

  const getActiveBorderColor = () => {
    switch (activeTab) {
      case 'manpower': return 'border-sky-400';
      case 'products': return 'border-amber-400';
      case 'services': return 'border-emerald-400';
      case 'shortlisted': return 'border-red-400';
      default: return 'border-[#889400]';
    }
  };

  const currentList = activeTab === 'manpower'
    ? displayedManpower
    : activeTab === 'products'
      ? displayedProducts
      : activeTab === 'services'
        ? displayedServices
        : displayedShortlisted;

  const showAllEmptyState = activeTab === 'all' && 
    displayedManpower.length === 0 && 
    displayedProducts.length === 0 && 
    displayedServices.length === 0;

  const tabs = [
    { id: 'all', label: 'All', icon: <FiCompass className="w-3.5 h-3.5" /> },
    { id: 'manpower', label: 'Manpower', icon: <FiUser className="w-3.5 h-3.5" /> },
    { id: 'products', label: 'Products', icon: <FiPackage className="w-3.5 h-3.5" /> },
    { id: 'services', label: 'Services', icon: <FiTool className="w-3.5 h-3.5" /> },
    { id: 'shortlisted', label: 'Shortlisted', icon: <FiHeart className="w-3.5 h-3.5 fill-current text-red-500" /> }
  ];

  const renderCategoryCard = (cat) => {
    const isShortlisted = shortlistedIds.includes(cat.id);
    return (
      <div
        key={cat.id}
        onClick={() => handleCategoryClick(cat)}
        className="flex flex-col items-center gap-2 group cursor-pointer relative"
      >
        {/* Heart/Shortlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleShortlist(cat);
          }}
          className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-all active:scale-90"
        >
          <FiHeart className={`w-3 h-3 transition-colors ${
            isShortlisted ? 'text-red-500 fill-current' : 'text-gray-400'
          }`} />
        </button>

        {/* Icon Container */}
        <div className={`w-full aspect-square rounded-2xl flex items-center justify-center border group-active:scale-95 transition-all overflow-hidden p-3.5 text-2xl shadow-sm ${
          cat.categoryType === 'manpower' 
            ? 'bg-sky-50 border-sky-100/50 hover:bg-sky-100' 
            : cat.categoryType === 'product'
              ? 'bg-amber-50 border-amber-100/50 hover:bg-amber-100'
              : 'bg-[#f5faff] border-sky-100/30 hover:bg-[#e6f2ff]'
        }`}>
          {cat.categoryType === 'manpower' ? (
            <span className="relative z-10">{cat.icon}</span>
          ) : cat.icon?.length > 2 ? (
            <img 
              src={toAssetUrl(cat.icon)} 
              alt={cat.title} 
              className="w-full h-full object-contain relative z-10 group-hover:scale-105 transition-transform" 
            />
          ) : (
            <span className="relative z-10">{cat.icon || '🛠️'}</span>
          )}
        </div>

        {/* Title */}
        <span className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-2 max-w-[72px]">
          {cat.title}
        </span>
      </div>
    );
  };

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

        {/* Scrollable Tab bar */}
        <div className="relative z-10 flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'shortlisted' && shortlistedIds.length === 0) {
                    toast('No shortlisted categories yet. Tap ❤️ on any category to save it!', { icon: 'ℹ️' });
                  }
                }}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wide shrink-0 transition-all active:scale-95 border ${
                  isActive
                    ? 'bg-[#0f172a] text-[#cfdc01] border-[#0f172a] shadow-sm'
                    : 'bg-white/95 text-gray-600 border-white/20 hover:bg-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'shortlisted' && shortlistedIds.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {shortlistedIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Catalog Section */}
      <main className="px-6 py-6 relative z-10 flex flex-col gap-6">
        
        {/* Render grouped sections when tab is 'all' */}
        {activeTab === 'all' && (
          <>
            {/* Manpower Section */}
            {displayedManpower.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[13px] font-black text-gray-900 tracking-tight leading-none uppercase pl-1 border-l-[3px] border-sky-400">
                  Manpower
                </h2>
                <div className="grid grid-cols-4 gap-x-3 gap-y-4 mt-2">
                  {displayedManpower.map(renderCategoryCard)}
                </div>
              </div>
            )}

            {/* Shop Products Section */}
            {displayedProducts.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[13px] font-black text-gray-900 tracking-tight leading-none uppercase pl-1 border-l-[3px] border-amber-400">
                  Shop Products
                </h2>
                <div className="grid grid-cols-4 gap-x-3 gap-y-4 mt-2">
                  {displayedProducts.map(renderCategoryCard)}
                </div>
              </div>
            )}

            {/* Services Section */}
            {displayedServices.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[13px] font-black text-gray-900 tracking-tight leading-none uppercase pl-1 border-l-[3px] border-[#a2ad02]">
                  Services
                </h2>
                <div className="grid grid-cols-4 gap-x-3 gap-y-4 mt-2">
                  {displayedServices.map(renderCategoryCard)}
                </div>
              </div>
            )}

            {showAllEmptyState && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FiCompass className="w-12 h-12 text-gray-300 animate-pulse mb-3" />
                <p className="text-xs font-black text-gray-400">
                  No categories found.
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  Try searching for a different service or product.
                </p>
              </div>
            )}
          </>
        )}

        {/* Render a single grid section when tab is NOT 'all' */}
        {activeTab !== 'all' && (
          <div className="flex flex-col gap-3">
            <h2 className={`text-[13px] font-black text-gray-900 tracking-tight leading-none uppercase pl-1 border-l-[3px] ${getActiveBorderColor()}`}>
              {getActiveTabTitle()}
            </h2>
            {currentList.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-3 gap-y-4 mt-2">
                {currentList.map(renderCategoryCard)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FiCompass className="w-12 h-12 text-gray-300 animate-pulse mb-3" />
                <p className="text-xs font-black text-gray-400">
                  No categories found in this section.
                </p>
                {activeTab === 'shortlisted' && (
                  <p className="text-[10px] text-gray-300 mt-1 max-w-[200px] mx-auto">
                    Tap the ❤️ icon on any category card to shortlist it!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Service Brand Category Detail Drawer */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        currentCity={currentCity}
      />
    </div>
  );
};

export default UserCategoriesPage;
