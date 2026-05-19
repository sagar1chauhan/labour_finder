import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiCalendar, FiShoppingCart, FiGrid } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const { cartCount } = useCart();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0 });
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
  const activeIndex = navItems.findIndex(item => item.id === activeTab);

  useEffect(() => {
    if (navRef.current) {
      const buttons = navRef.current.querySelectorAll('button');
      if (buttons[activeIndex]) {
        const button = buttons[activeIndex];
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        setIndicatorStyle({
          left: (buttonRect.left - navRect.left) + (buttonRect.width / 2) - 22,
        });
      }
    }
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
        >
          <nav 
            ref={navRef}
            className="w-full max-w-sm h-[64px] bg-[#111111]/95 backdrop-blur-2xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 flex items-center justify-between px-3 pointer-events-auto relative"
          >
            {/* Active Circle Indicator */}
            <motion.div
              className="absolute w-[44px] h-[44px] bg-white rounded-full z-0 shadow-lg"
              animate={{
                left: indicatorStyle.left,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />

            {navItems.map((item, idx) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="relative z-10 flex items-center justify-center w-[52px] h-full group outline-none"
                >
                  <div className="relative">
                    <Icon 
                      className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-[#0D9488] scale-110' : 'text-gray-500 group-hover:text-gray-300'}`} 
                    />
                    
                    {item.isCart && cartCount > 0 && (
                      <span className={`absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-white' : 'border-[#111111]'} transition-colors`}>
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
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
