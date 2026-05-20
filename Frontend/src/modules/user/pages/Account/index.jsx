import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { userAuthService } from '../../../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiEdit3,
  FiClipboard,
  FiHeadphones,
  FiStar,
  FiMapPin,
  FiSettings,
  FiChevronRight,
  FiLogOut,
  FiGift,
  FiPackage,
  FiCreditCard,
  FiBell
} from 'react-icons/fi';
import NotificationBell from '../../components/common/NotificationBell';

const Account = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: 'Harsh Pandey',
    phone: '7879363299',
    walletBalance: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAuthService.getProfile();
      if (response.success && response.user) {
        setUserProfile(prev => ({
          ...prev,
          ...response.user,
          walletBalance: response.user.wallet?.balance ?? 0
        }));
      }
    } catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    try {
      await userAuthService.logout();
      toast.success('Logged out');
      navigate('/user/login');
    } catch (error) {
      localStorage.clear();
      navigate('/user/login');
    }
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-gray-900" }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 bg-white rounded-[22px] border border-gray-50 shadow-sm active:bg-gray-50 transition-all group mb-2.5"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-[#889400]/10 text-[#889400]">
          <Icon className={`w-4 h-4 ${color === 'text-red-500' ? 'text-red-500' : ''}`} />
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</span>
      </div>
      <FiChevronRight className="w-4 h-4 text-gray-300 group-active:text-[#889400] transition-colors" />
    </motion.button>
  );

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden" style={{ backgroundColor: '#fbfde8' }}>
      <div className="relative z-10">
        <header 
          className="px-6 pt-10 pb-8 rounded-b-[40px] shadow-md shadow-gray-200/50 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-24 translate-x-24" />
          
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Profile</h1>
            <NotificationBell navigate={navigate} />
          </div>

          <div className="flex items-center gap-4">
             <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center text-white font-black text-2xl shadow-xl border-2 border-white/20">
                   {userProfile.name[0]}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-[#0f172a] rounded-lg flex items-center justify-center shadow-md border-2 border-white">
                   <FiEdit3 className="w-3.5 h-3.5" />
                </button>
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-900 leading-tight">{userProfile.name}</h2>
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest opacity-80 mt-0.5">{userProfile.phone}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                   <span className="px-2 py-0.5 bg-white/40 backdrop-blur-md text-gray-900 rounded-md text-[7px] font-black uppercase tracking-widest shadow-sm">Verified User</span>
                   {userProfile.usageRole && (
                     <span className="px-2 py-0.5 bg-[#F59E0B] text-white rounded-md text-[7px] font-black uppercase tracking-widest shadow-sm">
                       {userProfile.usageRole}
                     </span>
                   )}
                </div>
             </div>
          </div>
        </header>

        <main className="px-6 pt-8">
          {/* Stats Cards - Now properly separated from header */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm flex flex-col items-center">
              <div className="w-10 h-10 bg-[#889400]/10 rounded-xl flex items-center justify-center text-[#889400] mb-2.5">
                <FiCreditCard className="w-5 h-5" />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Wallet Balance</p>
              <p className="text-base font-black text-amber-600">₹{userProfile.walletBalance}</p>
            </div>
            <div className="bg-[#111111] p-4 rounded-[28px] shadow-xl flex flex-col items-center relative overflow-hidden group active:scale-95 transition-all">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-400 mb-2.5">
                <FiGift className="w-5 h-5" />
              </div>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">Earn Rewards</p>
              <p className="text-base font-black text-white">450 Pts</p>
            </div>
          </div>

          <div className="space-y-6 pb-12">
            <div>
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-4">My Activity</h3>
              <MenuItem icon={FiClipboard} label="Order & Bookings" onClick={() => navigate('/user/my-bookings')} />
              <MenuItem icon={FiMapPin} label="Saved Addresses" onClick={() => navigate('/user/manage-addresses')} />
            </div>

            <div>
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-4">Support</h3>
              <MenuItem icon={FiSettings} label="App Settings" onClick={() => navigate('/user/settings')} />
              <MenuItem icon={FiHeadphones} label="Help Center" onClick={() => navigate('/user/help-support')} />
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-4.5 bg-red-50 text-red-500 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all mb-12 border border-red-100"
            >
              <FiLogOut className="w-4.5 h-4.5" />
              Sign Out
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Account;
