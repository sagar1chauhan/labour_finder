import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiPackage, FiZap, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useCart } from '../../../../context/CartContext';
import NotificationBell from '../../components/common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeItem } = useCart();
  const [items, setItems] = useState(cartItems || []);

  useEffect(() => {
    setItems(cartItems || []);
  }, [cartItems]);

  const total = items.reduce((sum, item) => sum + (item.price * (item.serviceCount || 1)), 0);

  const handleRemove = (id) => {
    removeItem ? removeItem(id) : setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Item removed');
  };

  return (
    <div className="min-h-screen pb-48 relative" style={{ backgroundColor: '#fbfde8' }}>
      <div className="relative z-10">
        <header 
          className="px-6 pt-5 pb-4 rounded-b-[24px] shadow-md shadow-gray-200/50 sticky top-0 z-50"
          style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase">Your Cart</h1>
                <p className="text-[8px] font-bold text-gray-800 uppercase tracking-widest opacity-80 leading-none mt-0.5">{items.length} Items Selected</p>
              </div>
            </div>
            <NotificationBell navigate={navigate} />
          </div>
        </header>

        <main className="px-6 py-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id || item._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[24px] p-3 shadow-sm border border-gray-50 flex gap-3.5 relative group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-900 line-clamp-1 mb-0.5">{item.title}</h3>
                    <p className="text-[7px] font-black text-[#889400] bg-[#889400]/10 px-1.5 py-0.5 rounded-md w-fit uppercase tracking-widest">
                      {item.category}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-600">₹{item.price}</span>
                    <button 
                      onClick={() => handleRemove(item.id || item._id)}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100 active:scale-90 transition-all"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <FiShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-[9px] font-black uppercase tracking-widest">Your cart is empty</p>
            </div>
          )}
        </main>

        {items.length > 0 && (
          <div className="fixed bottom-24 left-0 right-0 px-6 z-30">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-white rounded-[32px] p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border border-gray-50"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Grand Total</p>
                  <p className="text-xl font-black text-gray-900">₹{total}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Current Deal</p>
                  <p className="text-[9px] font-black text-emerald-600 italic">Best Price Applied</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/user/checkout')}
                className="w-full h-11 bg-[#0f172a] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-md shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <FiZap className="w-3.5 h-3.5 fill-current" />
                Checkout Securely
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
