import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiCalendar, FiShoppingCart, FiGrid } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleToggle = (e) => setIsVisible(e.detail !== false);
    window.addEventListener('toggle-bottom-nav', handleToggle);
    return () => window.removeEventListener('toggle-bottom-nav', handleToggle);
  }, []);

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: FiHome, path: '/user' },
    { id: 'shop', label: 'Shop', icon: FiGrid, path: '/user/shop' },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar, path: '/user/my-bookings' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, path: '/user/cart', isCart: true },
    { id: 'account', label: 'Account', icon: FiUser, path: '/user/account' },
  ], []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/user' || path === '/user/') return 'home';
    if (path === '/user/shop') return 'shop';
    if (path === '/user/my-bookings') return 'bookings';
    if (path === '/user/cart') return 'cart';
    if (path === '/user/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-4 pb-safe pointer-events-auto"
        >
          <nav className="w-full max-w-md mx-auto h-[64px] flex items-center justify-between">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="flex-1 flex flex-col items-center justify-center h-full gap-1 outline-none relative active:scale-95 transition-transform"
                >
                  <div className="relative flex items-center justify-center">
                    <Icon 
                      className={`w-[22px] h-[22px] transition-colors duration-200 ${
                        isActive ? 'text-[#a2ad02]' : 'text-gray-400 group-hover:text-gray-600'
                      }`} 
                    />
                    
                    {item.isCart && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-[#a2ad02]' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;
