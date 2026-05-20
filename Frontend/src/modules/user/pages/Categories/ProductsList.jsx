import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiShoppingCart, FiInfo } from 'react-icons/fi';
import { publicCatalogService } from '../../../../services/catalogService';
import { useCity } from '../../../../context/CityContext';
import { useCart } from '../../../../context/CartContext';
import { toast } from 'react-hot-toast';
import LogoLoader from '../../../../components/common/LogoLoader';

const toAssetUrl = (url) => {
  if (!url) return '';
  const clean = url.replace('/api/upload', '/upload');
  if (clean.startsWith('http')) return clean;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const UserBrandProductsPage = () => {
  const navigate = useNavigate();
  const { categoryId, brandId } = useParams();
  const { currentCity } = useCity();
  const { cartCount, addToCart } = useCart();

  const [activeBrandId, setActiveBrandId] = useState(brandId);
  const [activeBrandTitle, setActiveBrandTitle] = useState('');
  const [products, setProducts] = useState([]);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (brandId) {
      setActiveBrandId(brandId);
    }
  }, [brandId]);

  useEffect(() => {
    fetchProducts();
  }, [activeBrandId, currentCity?._id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const cityId = currentCity?._id || currentCity?.id;
      const res = await publicCatalogService.getProductsByBrand(activeBrandId, cityId);
      if (res.success) {
        setProducts(res.products);
        setActiveBrandTitle(res.brand.title);
        // Map sibling list (add "All" option if needed or display siblings directly)
        setSiblings(res.siblings || []);
      }
    } catch (err) {
      console.error('Error fetching brand products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.basePrice,
      image: product.iconUrl,
      vendorId: product.vendor?.id || null
    });
    toast.success(`${product.title} added to cart!`);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#fbfde8' }}>
      {/* Top Header with Back Navigation */}
      <header 
        className="px-6 pt-10 pb-4 shadow-sm z-10 shrink-0"
        style={{ background: 'linear-gradient(180deg, #d5de23 0%, #dce640 41%, #e3ec72 100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/user/categories')} 
              className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all shadow-sm"
            >
              <FiArrowLeft className="w-4 h-4 text-green-900" />
            </button>
            <div>
              <h1 className="text-[13px] font-black text-gray-900 tracking-tight leading-tight uppercase">
                {activeBrandTitle || 'Products'}
              </h1>
              <p className="text-[8px] font-bold text-green-900 uppercase tracking-[0.2em] opacity-80 leading-none mt-0.5">
                Dynamic Storefront
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-800/70 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder={`Search in ${activeBrandTitle}...`} 
            className="w-full pl-10 pr-4 py-2 bg-white/95 rounded-xl border border-white/20 text-[11px] font-bold text-gray-700 h-[38px] focus:outline-none focus:ring-2 focus:ring-[#a2ad02]/30 transition-all" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </header>

      {/* Main Split Layout: Left Sidebar + Right Products Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scrollable Siblings */}
        <aside className="w-[72px] bg-white/80 border-r border-[#889400]/10 flex flex-col overflow-y-auto no-scrollbar py-4 items-center shrink-0">
          <div className="flex flex-col gap-5 w-full items-center">
            {siblings.map((sibling) => {
              const isActive = sibling.id === activeBrandId;
              
              return (
                <div 
                  key={sibling.id}
                  onClick={() => setActiveBrandId(sibling.id)}
                  className="w-full flex flex-col items-center cursor-pointer relative group"
                >
                  {/* Left highlight active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#a2ad02] rounded-r" />
                  )}
                  
                  {/* Thumbnail wrapper */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center p-1 border transition-all duration-300 ${
                    isActive 
                      ? 'border-[#a2ad02] bg-[#fbfde8] shadow-sm scale-105' 
                      : 'border-gray-100 bg-gray-50/50 group-hover:bg-gray-100'
                  }`}>
                    {sibling.icon ? (
                      <img 
                        src={toAssetUrl(sibling.icon)} 
                        alt={sibling.title} 
                        className="w-full h-full object-contain rounded-full" 
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">{sibling.title.charAt(0)}</span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <span className={`text-[7.5px] mt-1.5 text-center max-w-[62px] truncate uppercase leading-none tracking-tight transition-colors ${
                    isActive ? 'font-black text-gray-900' : 'font-bold text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {sibling.title}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Panel - Products List Grid */}
        <main className="flex-1 overflow-y-auto p-4 pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-[50vh]">
              <LogoLoader />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                // Calculate dynamic discount percentage
                const base = product.basePrice || 0;
                const discount = product.discountPrice || 0;
                const hasDiscount = discount > base;
                const discountPercent = hasDiscount 
                  ? Math.round(((discount - base) / discount) * 100)
                  : 0;
                
                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all duration-300 relative group"
                  >
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-gray-900 text-[6.5px] font-black px-1.5 py-0.5 rounded shadow-sm">
                        {discountPercent}% OFF
                      </div>
                    )}
                    
                    {/* Image Box */}
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 flex items-center justify-center p-2 relative">
                      {product.iconUrl ? (
                        <img 
                          src={toAssetUrl(product.iconUrl)} 
                          alt={product.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-300">{product.title.charAt(0)}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-[9px] font-black text-gray-900 leading-tight mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      
                      {/* Sub-label e.g. stock warning */}
                      <p className="text-[7px] font-bold text-amber-600 mb-2 mt-auto">
                        Only 5 left
                      </p>

                      {/* Pricing and Action row */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-gray-900">
                            ₹{base}
                          </span>
                          {hasDiscount && (
                            <span className="text-[7.5px] font-bold text-gray-400 line-through">
                              ₹{discount}
                            </span>
                          )}
                        </div>
                        
                        {/* Dynamic Add to Cart Action */}
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="px-2.5 py-1 bg-white hover:bg-[#a2ad02] border border-[#a2ad02]/30 hover:border-[#a2ad02] text-[#a2ad02] hover:text-white rounded-md text-[8px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <FiInfo className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-[10px] font-bold text-gray-400">No products available in this brand.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserBrandProductsPage;
