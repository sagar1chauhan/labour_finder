import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiClock, FiUser } from 'react-icons/fi';
import { HiHome, HiClock, HiUser } from 'react-icons/hi';

const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome, activeIcon: HiHome, path: '/labour/dashboard' },
    { id: 'history', label: 'History', icon: FiClock, activeIcon: HiClock, path: '/labour/history' },
    { id: 'profile', label: 'Profile', icon: FiUser, activeIcon: HiUser, path: '/labour/profile' },
  ];

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white"
      style={{
        zIndex: 100,
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -8px 24px rgba(13, 148, 136, 0.1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center relative transition-all duration-200"
              style={{ width: '64px' }}
            >
              {isActive && (
                <div 
                  className="absolute -top-3 w-8 h-1 rounded-full bg-teal-500 shadow-[0_2px_8px_rgba(13,148,136,0.3)]"
                />
              )}
              
              <div className={`relative mb-1 transition-all duration-300 ${isActive ? 'scale-110' : 'text-gray-400'}`}>
                <IconComponent 
                  className="w-6 h-6" 
                  style={{ color: isActive ? '#0d9488' : '#9ca3af' }}
                />
              </div>
              
              <span 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                  isActive ? 'text-teal-600' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;
