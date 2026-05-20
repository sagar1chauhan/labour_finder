import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiUsers, FiUser, FiBox } from 'react-icons/fi';
import { HiHome, HiBriefcase, HiUsers, HiUser, HiViewGrid } from 'react-icons/hi';
import { FaWallet, FaHardHat } from 'react-icons/fa';
import { vendorTheme as themeColors } from '../../../../theme';

const BottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingJobsCount, setPendingJobsCount] = useState(0);

  // Load pending jobs count from localStorage
  useEffect(() => {
    const updatePendingCount = () => {
      try {
        // Count active jobs (PENDING only) to show new requests
        const acceptedBookings = JSON.parse(localStorage.getItem('vendorAcceptedBookings') || '[]');
        const activeJobs = acceptedBookings.filter(job => job.status === 'PENDING');
        setPendingJobsCount(activeJobs.length);
      } catch (error) {
        console.error('Error reading pending jobs:', error);
      }
    };

    updatePendingCount();
    window.addEventListener('storage', updatePendingCount);
    window.addEventListener('vendorJobsUpdated', updatePendingCount);

    return () => {
      window.removeEventListener('storage', updatePendingCount);
      window.removeEventListener('vendorJobsUpdated', updatePendingCount);
    };
  }, []);

  // Use useMemo to update navItems when pendingJobsCount changes
  const navItems = useMemo(() => {
    // Count jobs that require attention (Pending, Accepted, In Progress)
    const badgeCount = pendingJobsCount;

    return [
      { path: '/vendor/dashboard', icon: FiHome, activeIcon: HiHome, label: 'Home' },
      { path: '/vendor/jobs', icon: FiBriefcase, activeIcon: HiBriefcase, label: 'Jobs', badge: badgeCount },
      { path: '/vendor/wallet', icon: FaWallet, activeIcon: FaWallet, label: 'Wallet' },
      { path: '/vendor/profile', icon: FiUser, activeIcon: HiUser, label: 'Profile' },
    ];
  }, [pendingJobsCount]);

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Hide nav when specific routes are active (booking alerts, maps)
  const hideNavRoutes = [
    '/vendor/booking-alert/',
    '/vendor/booking/',
  ];

  const shouldHideNav = hideNavRoutes.some(route =>
    location.pathname.includes(route) &&
    (location.pathname.includes('/map') || location.pathname.includes('/alert/'))
  );

  if (shouldHideNav) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 40,
        background: '#FFFFFF',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/vendor/dashboard' && location.pathname === '/vendor');
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center relative w-16 h-14 transition-all duration-200 group active:scale-95"
            >
              {/* Active Indicator Bar - Clean flat style at the top */}
              {isActive && (
                <div
                  className="absolute top-0 w-8 h-1 rounded-full"
                  style={{
                    background: '#a2ad02',
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative mb-0.5">
                  <IconComponent
                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}
                    style={{
                      color: isActive ? themeColors.button : '#9CA3AF',
                      filter: isActive ? `drop-shadow(0 2px 4px ${themeColors.brand.teal}1A)` : 'none'
                    }}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="absolute bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      style={{
                        top: '-6px',
                        right: '-8px',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        fontSize: '10px',
                        lineHeight: '18px',
                        border: '2px solid white',
                        boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                        zIndex: 50,
                      }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] transition-colors duration-300 ${isActive ? 'font-bold' : 'font-medium text-gray-500'}`}
                  style={{
                    color: isActive ? themeColors.button : '#6B7280',
                  }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
export default BottomNav;

