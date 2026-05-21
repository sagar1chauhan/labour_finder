import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiStar, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { useCart } from '../../../../context/CartContext';
import { toast } from 'react-hot-toast';

const DUMMY_SHOP_PRODUCTS = [
  {
    id: 'p1',
    title: "UltraTech PPC Cement (50 kg)",
    basePrice: 385,
    discountPrice: 390,
    unit: "bag",
    stockWarning: "Only 5 left",
    image: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
  },
  {
    id: 'p2',
    title: "Birla White Cement (50 kg)",
    basePrice: 1155,
    discountPrice: 1250,
    unit: "bag",
    stockWarning: "Limited stock",
    image: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
  },
  {
    id: 'p3',
    title: "Saint Gobain Gyproc Xpert+ Gypsum Plaster (20 kg)",
    basePrice: 270,
    discountPrice: 300,
    unit: "bag",
    image: "https://res.cloudinary.com/deorxby43/image/upload/v1779274407/products/pn4b1tmtdcma9mppi7z0.png"
  },
  {
    id: 'p4',
    title: "Asian Paints Royale Play (1 Ltr)",
    basePrice: 950,
    discountPrice: 1050,
    unit: "ltr",
    image: "https://img.freepik.com/free-photo/bucket-paint-with-brush_23-2147772344.jpg?w=740"
  },
  {
    id: 'p5',
    title: "Bosch GSB 550 Professional Impact Drill",
    basePrice: 2800,
    discountPrice: 3200,
    unit: "pcs",
    stockWarning: "Best Seller",
    image: "https://img.freepik.com/free-photo/drill-with-drill-bit_1398-3168.jpg?w=740"
  }
];

const ShopDetails = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Dummy shop details
  const shop = {
    name: "Shreeji Hardware & Tools",
    rating: "4.8",
    reviews: 124,
    image: "https://img.freepik.com/free-photo/view-hardware-store-with-tools-equipment_23-2151693766.jpg?w=740",
    address: "123 Market Street, City Center",
    openTime: "09:00 AM - 08:00 PM"
  };

  const [products] = useState(DUMMY_SHOP_PRODUCTS);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header Image & Info */}
      <div className="relative w-full h-[200px] bg-gray-900">
        <img 
          src={shop.image} 
          alt={shop.name} 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/user/cart')}
              className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
            >
              <FiShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-green-400">
              <FiStar className="w-3 h-3 fill-current" />
              <span className="text-[9px] font-black text-white">{shop.rating}</span>
            </div>
            <span className="text-[9px] text-gray-300 font-medium">({shop.reviews} reviews)</span>
          </div>
          <h1 className="text-xl font-black text-white leading-tight mb-1">{shop.name}</h1>
          <p className="text-[10px] font-medium text-gray-300 flex items-center gap-1">
            <FiInfo className="w-3 h-3" /> {shop.openTime}
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-20 px-4 py-4 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between">
         <div className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input 
               type="text" 
               placeholder={`Search in ${shop.name}...`} 
               className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cfdc01] transition-all h-[38px]"
            />
         </div>
      </div>

      <div className="px-4 py-6">
        <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase mb-4">All Products</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.map(product => {
            const hasDiscount = product.discountPrice && product.discountPrice > product.basePrice;
            const discountPercent = hasDiscount ? Math.round(((product.discountPrice - product.basePrice) / product.discountPrice) * 100) : 0;
            
            return (
              <div 
                key={product.id}
                className="bg-white rounded-[20px] p-2 shadow-sm border border-gray-50 flex flex-col group cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-[16px] overflow-hidden mb-2 bg-gray-50 p-2 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                  {product.stockWarning && (
                    <div className="absolute bottom-1.5 left-1.5 bg-red-50 px-1.5 py-0.5 rounded-md text-[7px] font-black text-red-600 border border-red-100 shadow-sm">
                      {product.stockWarning}
                    </div>
                  )}
                  <div 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-all hover:bg-[#cfdc01] hover:border-[#cfdc01] hover:text-[#0f172a] text-gray-600"
                  >
                    <span className="text-sm font-black">+</span>
                  </div>
                </div>
                <div className="px-1 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-[9px] font-black text-gray-900 line-clamp-2 leading-snug mb-1">{product.title}</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-gray-900">
                        ₹{product.basePrice}{product.unit ? <span className="text-[8px] font-semibold text-gray-500">/{product.unit}</span> : ''}
                      </span>
                      {hasDiscount && (
                        <span className="text-[9px] font-semibold text-gray-400 line-through">
                          ₹{product.discountPrice}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-[9px] font-bold text-green-700 mt-0.5">
                        {discountPercent}% OFF
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopDetails;
