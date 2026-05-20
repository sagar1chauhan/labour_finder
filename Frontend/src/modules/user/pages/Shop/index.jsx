import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiSliders, FiShoppingCart, FiStar, FiPackage, FiZap, FiChevronLeft, FiShare2, FiHeart, FiPhone, FiMessageCircle, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/common/NotificationBell';
import { publicCatalogService } from '../../../../services/catalogService';
import { useCart } from '../../../../context/CartContext';
import { useCity } from '../../../../context/CityContext';
import LogoLoader from '../../../../components/common/LogoLoader';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const DUMMY_PRODUCTS = [
  { id: 'p1', title: 'Premium Wall Paint', category: 'Painting', price: 1200, rating: '4.9', icon: 'https://img.freepik.com/free-photo/paint-buckets-with-brushes-renovation_23-2148814234.jpg?w=740' },
  { id: 'p2', title: 'Copper Wiring Bundle', category: 'Electrical', price: 850, rating: '4.8', icon: 'https://img.freepik.com/free-photo/electrician-builder-at-work-with-cables-in-hands_169016-16164.jpg?w=740' },
];

const ProductCard = ({ product, onAdd, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => onClick(product)}
    className="bg-white rounded-[24px] p-2.5 shadow-sm border border-gray-50 flex flex-col group active:scale-[0.98] transition-all cursor-pointer"
  >
    <div className="relative aspect-square rounded-[18px] overflow-hidden bg-gray-50 mb-2.5">
      <img src={product.icon} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
        <FiStar className="w-2 h-2 text-orange-400 fill-orange-400" />
        <span className="text-[7px] font-black text-gray-700">{product.rating}</span>
      </div>
    </div>
    <div className="px-1 flex-1 flex flex-col">
      <h3 className="font-black text-gray-900 text-[10px] line-clamp-1 mb-0.5">{product.title}</h3>
      <p className="text-[7px] text-[#a2ad02] font-black uppercase tracking-wider mb-2">{product.category}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[12px] font-black text-amber-600">₹{product.price}</span>
        <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} className="w-7 h-7 bg-[#0f172a] text-white rounded-lg flex items-center justify-center shadow-md active:scale-90 transition-all">
          <FiShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

const UserShopPage = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { currentCity } = useCity();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (currentCity) fetchData();
  }, [currentCity?._id]);

  const fetchData = async () => {
    try {
      const cityId = currentCity?._id || currentCity?.id;
      if (!cityId) return;
      const res = await publicCatalogService.getHomeContent(cityId);
      if (res.success && res.categories?.length > 0) setCategories(res.categories);
      const brandsRes = await publicCatalogService.getBrands({ type: 'product', cityId });
      if (brandsRes.success && brandsRes.brands?.length > 0) {
        setProducts(brandsRes.brands.map(p => ({
          id: p._id || p.id,
          title: p.title,
          category: p.categoryName || 'General',
          price: p.price || 0,
          rating: '4.8',
          icon: toAssetUrl(p.icon || p.images?.[0]),
          categoryId: p.categoryId
        })));
      }
    } catch (err) { console.error(err); }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen pb-24 relative" style={{ backgroundColor: '#fbfde8' }}>
      <div className="relative z-10">
        <header 
          className="px-6 pt-5 pb-4 rounded-b-[24px] shadow-md shadow-gray-200/50 sticky top-0 z-50"
          style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all">
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase">Marketplace</h1>
                <p className="text-[8px] font-bold text-gray-800 uppercase tracking-[0.2em] opacity-80 leading-none mt-0.5">Premium Materials</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div onClick={() => navigate('/user/cart')} className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 cursor-pointer relative active:scale-90 transition-all shadow-sm">
                <FiShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <NotificationBell navigate={navigate} />
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input type="text" placeholder="Search materials..." className="w-full pl-10 pr-4 py-2 bg-white/95 rounded-xl border border-white/20 text-[11px] font-bold text-gray-700 h-[40px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </header>

        <div className="px-6 py-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button onClick={() => setSelectedCategory('all')} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-[#0f172a] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 shadow-sm'}`}>All Products</button>
          {categories.filter(c => c.categoryType === 'product').map(cat => (
            <button key={cat._id || cat.id} onClick={() => setSelectedCategory(cat._id || cat.id)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === (cat._id || cat.id) ? 'bg-[#0f172a] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 shadow-sm'}`}>{cat.title}</button>
          ))}
        </div>

        <main className="px-6 py-4 pb-12">
          <div className="grid grid-cols-2 gap-3.5">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={() => toast.success('Added!')} onClick={(p) => setSelectedProduct(p)} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserShopPage;
