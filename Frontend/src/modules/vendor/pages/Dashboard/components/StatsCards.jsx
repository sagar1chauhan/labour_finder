import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';

import { vendorTheme as themeColors } from '../../../../../theme';

const StatsCards = memo(({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Today's Earnings",
      value: `₹${stats.todayEarnings.toLocaleString()}`,
      icon: "https://cdn-icons-gif.flaticon.com/15575/15575639.gif",
      gradient: 'linear-gradient(135deg, #fbfde8 0%, #f5f8be 100%)',
      accent: '#a2ad02',
      onClick: () => navigate('/vendor/earnings')
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      icon: "https://cdn-icons-gif.flaticon.com/17702/17702121.gif",
      gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      accent: '#0284c7',
      onClick: () => navigate('/vendor/booking-alerts')
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: "https://cdn-icons-gif.flaticon.com/19018/19018451.gif",
      gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      accent: '#16a34a',
      onClick: () => navigate('/vendor/jobs')
    },
    {
      title: 'My Services',
      value: stats.totalCategories || 0,
      icon: "https://cdn-icons-gif.flaticon.com/15370/15370728.gif",
      gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      accent: '#ea580c',
      onClick: () => navigate('/vendor/my-services')
    }
  ];

  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map((card, index) => {
          const isAnimated = typeof card.icon === 'string' && card.icon.endsWith('.gif');
          const IconComponent = !isAnimated ? card.icon : null;

          return (
            <div
              key={index}
              onClick={card.onClick}
              className="rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-95 transition-all duration-300"
              style={{
                background: card.gradient,
                border: `1.5px solid ${card.accent}15`,
                boxShadow: `0 4px 12px ${card.accent}10`,
              }}
            >
              {/* Decorative Pattern */}
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
                style={{
                  background: `radial-gradient(circle, ${card.accent} 0%, transparent 70%)`,
                  transform: 'translate(10px, -10px)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 leading-tight">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className="p-1.5 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${card.accent}25`,
                      width: '40px',
                      height: '40px'
                    }}
                  >
                    {isAnimated ? (
                      <img 
                        src={card.icon} 
                        alt={card.title} 
                        className="w-8 h-8 object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    ) : (
                      <IconComponent className="w-5 h-5" style={{ color: card.accent }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

StatsCards.displayName = 'VendorStatsCards';

export default StatsCards;
