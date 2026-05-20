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

const DUMMY_SIBLINGS = [
  { id: 'all', title: 'All', icon: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png' },
  { id: 'ppc', title: 'Ppc', icon: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png' },
  { id: 'white-cement', title: 'White Cement', icon: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png' },
  { id: 'punning-plaster', title: 'Punning Plaster', icon: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png' },
  { id: 'gypsum-sheets', title: 'Gypsum Sheets', icon: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png' },
  { id: 'gypsum-screw', title: 'Gypsum Screw', icon: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png' },
];

const DUMMY_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'UltraTech PPC Cement (50 kg)',
    basePrice: 385,
    discountPrice: 390,
    iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
    unit: 'bag'
  },
  {
    id: 'prod_2',
    title: 'Birla White Cement (50 kg)',
    basePrice: 1155,
    discountPrice: 1155,
    iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
    stockWarning: 'Only 5 left',
    unit: 'bag'
  },
  {
    id: 'prod_3',
    title: 'Saint Gobain Gyproc Xpert+ Gypsum Plaster of Paris POP Punning Powder (20 kg)',
    basePrice: 270,
    discountPrice: 350,
    iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
    stockWarning: 'Only 5 left',
    unit: 'bag'
  },
  {
    id: 'prod_4',
    title: 'Saint Gobain Gyproc Plain Gypsum Board / Wall & Ceiling Drywall Sheet (12.5 mm, 4 x 6 feet)',
    basePrice: 580,
    discountPrice: 580,
    iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
    unit: 'piece'
  },
  {
    id: 'prod_5',
    title: 'Drywall Screws (Pack of 100)',
    basePrice: 120,
    discountPrice: 150,
    iconUrl: 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png',
    unit: 'pack'
  }
];

const FlyingImage = ({ img }) => {
  const [style, setStyle] = React.useState({
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

  React.useEffect(() => {
    // Delay slightly to ensure transition triggers after mount
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
        // Fallback to dummy data if empty
        const fetchedProducts = res.products?.length > 0 ? res.products : DUMMY_PRODUCTS;
        const fetchedSiblings = res.siblings?.length > 0 ? res.siblings : DUMMY_SIBLINGS;
        
        setProducts(fetchedProducts);
        setActiveBrandTitle(res.brand.title || 'Cement & Plaster');
        setSiblings(fetchedSiblings);
      }
    } catch (err) {
      console.error('Error fetching brand products:', err);
      // Fallback on error
      setProducts(DUMMY_PRODUCTS);
      setActiveBrandTitle('Cement & Plaster');
      setSiblings(DUMMY_SIBLINGS);
    } finally {
      setLoading(false);
    }
  };

  const [flyingImages, setFlyingImages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = (product, e) => {
    // Find the nearest card/container image to clone and fly
    const cardEl = e?.currentTarget?.closest('.group');
    const imgEl = cardEl?.querySelector('img');
    const cartEl = document.getElementById('cart-icon');

    if (imgEl && cartEl) {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();
      
      const id = Date.now() + Math.random();
      const imageSrc = product.iconUrl ? toAssetUrl(product.iconUrl) : '';

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

      // Delay actual cart state addition and trigger bounce after flight completes (800ms)
      setTimeout(() => {
        addToCart({
          id: product.id,
          serviceId: product.id,
          categoryId: categoryId || null,
          title: product.title,
          price: product.basePrice,
          image: product.iconUrl,
          icon: product.iconUrl,
          category: 'Product',
          vendorId: product.vendor?.id || null
        });
        
        // Bounce animation on cart
        cartEl.classList.add('cart-bounce');
        setTimeout(() => {
          cartEl.classList.remove('cart-bounce');
        }, 400);

        setFlyingImages(prev => prev.filter(item => item.id !== id));
        toast.success(`${product.title} added to cart!`);
      }, 800);
    } else {
      // Fallback
      addToCart({
        id: product.id,
        serviceId: product.id,
        categoryId: categoryId || null,
        title: product.title,
        price: product.basePrice,
        image: product.iconUrl,
        icon: product.iconUrl,
        category: 'Product',
        vendorId: product.vendor?.id || null
      });
      toast.success(`${product.title} added to cart!`);
    }
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
              id="cart-icon"
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
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all duration-300 relative group cursor-pointer"
                  >
                    {/* Image Box */}
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2 relative">
                      {product.iconUrl ? (
                        <img 
                          src={toAssetUrl(product.iconUrl)} 
                          alt={product.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-300">{product.title.charAt(0)}</span>
                      )}
                      
                      {/* ADD Button hovering over image bottom-right */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product, e); }}
                        className="absolute bottom-1 right-1 px-3 py-1 bg-white border border-[#a2ad02] text-[#a2ad02] hover:bg-[#a2ad02] hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                      >
                        ADD
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-[11px] font-semibold text-gray-800 leading-tight mb-1.5 line-clamp-2">
                        {product.title}
                      </h3>
                      
                      {/* Sub-label e.g. stock warning */}
                      {(product.stockWarning || product.stock) && (
                        <p className="text-[9px] font-bold text-amber-600 mb-1.5">
                          {product.stockWarning || 'Limited stock'}
                        </p>
                      )}

                      {/* Pricing row */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                        <span className="text-[12px] font-black text-gray-900">
                          ₹{base}{product.unit ? <span className="text-[9px] font-semibold text-gray-500">/{product.unit}</span> : ''}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] font-semibold text-gray-400 line-through">
                            ₹{discount}
                          </span>
                        )}
                      </div>
                      
                      {/* Discount Text */}
                      {hasDiscount && (
                        <p className="text-[10px] font-bold text-green-700 mt-1">
                          {discountPercent}% OFF
                        </p>
                      )}
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

      {/* Fly-to-Cart Flying Previews */}
      {flyingImages.map(img => (
        <FlyingImage key={img.id} img={img} />
      ))}

      {/* Product Detail Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedProduct(null)}
          />
          
          {/* Sheet */}
          <div 
            className="relative bg-white rounded-t-[32px] max-h-[92vh] overflow-hidden flex flex-col z-10 slide-up shadow-2xl"
            style={{ minHeight: '70vh' }}
          >
            {/* Round floating Back Button */}
            <div className="absolute top-4 left-4 z-20">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 border border-gray-100 shadow-md active:scale-90 transition-all"
              >
                <FiArrowLeft className="w-4 h-4 text-green-950" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto pb-28">
              {/* Centered Large Image */}
              <div className="aspect-[4/3] w-full bg-gray-50 flex items-center justify-center p-6 relative">
                {selectedProduct.iconUrl ? (
                  <img 
                    src={toAssetUrl(selectedProduct.iconUrl)} 
                    alt={selectedProduct.title} 
                    className="max-w-[70%] max-h-[85%] object-contain"
                  />
                ) : (
                  <span className="text-5xl font-black text-gray-300">{selectedProduct.title.charAt(0)}</span>
                )}
                
                {/* Carousel Indicator dot */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="px-6 pt-6">
                <h2 className="text-[17px] font-black text-gray-900 leading-snug">
                  {selectedProduct.title}
                </h2>
                
                {/* Pricing row matching exact screenshot layout */}
                {(() => {
                  const base = selectedProduct.basePrice || 0;
                  const discount = selectedProduct.discountPrice || 0;
                  const hasDiscount = discount > base;
                  const discountPercent = hasDiscount 
                    ? Math.round(((discount - base) / discount) * 100)
                    : 0;
                  
                  return (
                    <div className="flex items-baseline gap-2 mt-4 mb-4">
                      <span className="text-[19px] font-black text-gray-900">
                        ₹{base}
                        <span className="text-xs font-bold text-gray-500">/{selectedProduct.unit || 'bag'}</span>
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-xs font-semibold text-gray-400 line-through">
                            ₹{discount}
                          </span>
                          <span className="text-xs font-black text-green-700">
                            {discountPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  );
                })()}

                <hr className="border-gray-100 my-4" />

                {/* Multiline Description matching exact screenshot */}
                <div className="space-y-3 text-[11px] text-gray-500 leading-relaxed font-bold">
                  {selectedProduct.description ? (
                    <p>{selectedProduct.description}</p>
                  ) : (
                    <>
                      <p>High-quality {selectedProduct.title.toLowerCase()} for concrete, masonry and general construction work.</p>
                      <p>Ideal for residential, commercial and repair applications.</p>
                      <p>Provides strong bonding, better workability and long-lasting durability.</p>
                      <p>Better than ordinary alternatives due to improved finish and consistent strength.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-20 shadow-xl">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pack Weight</p>
                <p className="text-[11px] font-black text-gray-900 leading-none">
                  {selectedProduct.unit === 'bag' ? '50 kg' : `1 ${selectedProduct.unit || 'piece'}`}
                </p>
                <p className="text-[13px] font-black text-[#a2ad02] mt-1.5 leading-none">
                  ₹{selectedProduct.basePrice}<span className="text-[10px] font-semibold text-gray-500">/{selectedProduct.unit || 'bag'}</span>
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(selectedProduct, e);
                  setSelectedProduct(null);
                }}
                className="px-6 py-3 bg-[#d5de23] hover:bg-[#a2ad02] text-gray-950 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 border border-[#b2bf05]"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stylesheet for smooth bounce/scale animations */}
      <style>{`
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .cart-bounce {
          animation: cartBounce 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        .slide-up {
          animation: slideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default UserBrandProductsPage;
