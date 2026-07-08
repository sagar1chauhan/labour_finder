import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { useCart } from '../../../../context/CartContext';
import { publicCatalogService } from '../../../../services/catalogService';
import publicDataService from '../../../../services/publicDataService';
import { toast } from 'react-hot-toast';
import LogoLoader from '../../../../components/common/LogoLoader';

const ShopDetails = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      try {
        setLoading(true);
        // 1. Fetch shop details
        const shopRes = await publicDataService.getPublicShops();
        if (shopRes.success && shopRes.shops) {
          const matchedShop = shopRes.shops.find(s => s.id === shopId);
          if (matchedShop) {
            setShop(matchedShop);

            // 2. Fetch all products under this shop's categories
            const allProductsList = [];
            const catRes = await publicCatalogService.getCategories();
            
            if (catRes?.success && catRes.categories) {
              // Find matching categories for this shop
              const shopServices = matchedShop.services || [];
              const matchedCats = catRes.categories.filter(c => 
                shopServices.some(s => s.toLowerCase().trim() === c.title.toLowerCase().trim())
              );

              // For each matched category, fetch its brands and products
              for (const cat of matchedCats) {
                const brandRes = await publicCatalogService.getBrands({ categoryId: cat.id });
                if (brandRes?.success && brandRes.brands) {
                  for (const brand of brandRes.brands) {
                    const prodRes = await publicCatalogService.getProductsByBrand(brand.id || brand._id);
                    if (prodRes?.success && prodRes.products) {
                      prodRes.products.forEach(p => {
                        allProductsList.push({
                          id: p.id || p._id,
                          title: p.title,
                          basePrice: p.basePrice || 0,
                          discountPrice: p.discountPrice || p.basePrice || 0,
                          unit: p.unit || 'pcs',
                          stockWarning: p.stockWarning || null,
                          image: p.iconUrl || 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png'
                        });
                      });
                    }
                  }
                }
              }
            }

            // Fallback: If no products matched, load all products so it's not empty
            if (allProductsList.length === 0) {
              const featRes = await publicDataService.getFeaturedProducts();
              if (featRes.success && featRes.data) {
                featRes.data.forEach(group => {
                  if (group.products) {
                    group.products.forEach(p => {
                      allProductsList.push({
                        id: p.id || p._id,
                        title: p.title,
                        basePrice: p.basePrice || 0,
                        discountPrice: p.discountPrice || p.basePrice || 0,
                        unit: p.unit || 'pcs',
                        stockWarning: p.stockWarning || null,
                        image: p.iconUrl || 'https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png'
                      });
                    });
                  }
                });
              }
            }

            setProducts(allProductsList);
          }
        }
      } catch (err) {
        console.error('Failed to load shop details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopAndProducts();
    }
  }, [shopId]);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      serviceId: product.id,
      categoryId: null,
      title: product.title,
      price: product.basePrice,
      image: product.image,
      icon: product.image,
      category: 'Product',
      vendorId: shopId
    });
    
    toast.success(`${product.title} added to cart!`);
  };

  if (loading) return <LogoLoader />;
  if (!shop) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-sm font-bold text-gray-500 mb-4">Shop not found</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header Image & Info */}
      <div className="relative w-full h-[200px] bg-gray-900">
        <img 
          src={shop.image || "https://img.freepik.com/free-photo/view-hardware-store-with-tools-equipment_23-2151693766.jpg?w=740"} 
          alt={shop.name} 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-lg font-black tracking-tight leading-tight">{shop.name}</h1>
          <p className="text-[9px] font-medium opacity-80 mt-1">{shop.address}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-green-600/90 px-1.5 py-0.5 rounded text-white text-[9px] font-bold">
              <FiStar className="w-2.5 h-2.5 fill-current" />
              <span>{shop.rating || '4.5'}</span>
            </div>
            <span className="text-[9px] opacity-80">({shop.reviews || '10+'} reviews)</span>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-1.5 mb-4">
          <FiInfo className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Available Products</span>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 opacity-50">
            <FiShoppingBag className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500">No products available at this store</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => {
              const base = product.basePrice || 0;
              const discount = product.discountPrice || 0;
              const hasDiscount = discount > 0 && discount < base;
              const priceToDisplay = hasDiscount ? discount : base;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl p-3 border border-gray-100 flex gap-3 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 leading-tight mb-1 truncate">{product.title}</h3>
                      {product.stockWarning && (
                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase tracking-wider">{product.stockWarning}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-gray-900">₹{priceToDisplay}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through font-semibold">₹{base}</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="px-3 py-1 bg-[#0f172a] text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetails;
