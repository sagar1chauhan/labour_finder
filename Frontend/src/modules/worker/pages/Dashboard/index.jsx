import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiChevronRight, FiUser, FiBell, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { workerTheme as themeColors, vendorTheme } from '../../../../theme';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import { registerFCMToken } from '../../../../services/pushNotificationService';
import { SkeletonProfileHeader, SkeletonDashboardStats, SkeletonList } from '../../../../components/common/SkeletonLoaders';
import OptimizedImage from '../../../../components/common/OptimizedImage';
import { useSocket } from '../../../../context/SocketContext';
import WorkerJobAlertModal from '../../components/bookings/WorkerJobAlertModal';
import LogoLoader from '../../../../components/common/LogoLoader';


const Dashboard = () => {
  const navigate = useNavigate();

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'COMPLETED': 'Completed',
      'ASSIGNED': 'Assigned',
      'VISITED': 'Visited',
      'WORK_DONE': 'Work Done',
    };
    return statusMap[status] || status;
  };

  const [stats, setStats] = useState({
    pendingJobs: 0,
    acceptedJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    rating: 0,
  });
  const [workerProfile, setWorkerProfile] = useState({
    name: 'Worker Name',
    phone: '+91 9876543210',
    photo: null,
    categories: [],
    address: null,
  });
  const [recentJobs, setRecentJobs] = useState([]);

  // Set background gradient
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  const [alertJobId, setAlertJobId] = useState(null);


  // Fetch Dashboard Data Function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Profile, Stats and Recent Jobs in parallel (Stats also includes recent jobs but let's be robust)
      const [profileRes, statsRes] = await Promise.all([
        workerService.getProfile(),
        workerService.getDashboardStats()
      ]);

      if (profileRes.success) {
        const profile = profileRes.worker;
        setWorkerProfile({
          name: profile.name || 'Worker Name',
          phone: profile.phone || '',
          photo: profile.profilePhoto || null,
          categories: profile.serviceCategories || (profile.serviceCategory ? [profile.serviceCategory] : []),
          address: profile.address,
        });
      }

      if (statsRes.success) {
        const { totalEarnings, activeJobs, completedJobs, rating, recentJobs: apiRecentJobs } = statsRes.data;

        setStats(prev => ({
          ...prev,
          totalEarnings: totalEarnings || 0,
          thisMonthEarnings: totalEarnings || 0, // Assuming total is this month for now or total
          pendingJobs: activeJobs || 0, // Using active for pending display for now, or map specifically if needed
          acceptedJobs: activeJobs || 0, // Overlap in meaning, simplify
          completedJobs: completedJobs || 0,
          rating: rating || 0
        }));

        // Use recent jobs from stats API
        if (apiRecentJobs && apiRecentJobs.length > 0) {
          setRecentJobs(apiRecentJobs.map(job => ({
            id: job._id,
            serviceType: job.serviceId?.title || job.serviceName || 'Service',
            customerName: job.userId?.name || 'Customer',
            location: job.address?.city || 'Location N/A',
            time: job.scheduledTime || 'N/A',
            status: job.status,
            price: job.finalAmount,
          })));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Load real data from API
  useEffect(() => {
    fetchDashboardData();

    // Ask for notification permission and register FCM
    registerFCMToken('worker', true).catch(err => console.error('FCM registration failed:', err));

    // Listen for updates
    const handleUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('workerJobsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('workerJobsUpdated', handleUpdate);
    };

  }, []);



  // Socket Listener for New Jobs
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      // Listen for new job assignments
      if ((notif.type === 'booking_created' || notif.type === 'job_assigned') && notif.relatedId) {
        setAlertJobId(notif.relatedId);
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
        <Header title="Dashboard" showBack={false} />
        <main className="px-4 py-4 space-y-6">
          <SkeletonProfileHeader />
          <SkeletonDashboardStats />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonList count={3} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: themeColors.backgroundGradient }}>
      <Header title="Dashboard" showBack={false} notificationCount={stats.pendingJobs} />

      <main className="pt-0">


        {/* Incomplete Profile Prompt */}
        {((!workerProfile.categories || workerProfile.categories.length === 0) ||
          (!workerProfile.address || Object.keys(workerProfile.address).length === 0)) && (
            <div className="px-4 pt-4 -mb-1">
              <div
                onClick={() => navigate('/worker/profile')}
                className="relative overflow-hidden p-4 rounded-xl cursor-pointer group transition-all duration-300 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
                  boxShadow: '0 4px 15px rgba(255, 193, 7, 0.15)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                }}
              >
                {/* Warning Pulse Animation */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FiClock className="w-24 h-24 text-amber-600 animate-pulse" style={{ transform: 'translate(20%, -20%)' }} />
                </div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-amber-500 text-white rounded-full shadow-inner shadow-amber-700/50">
                    <FiClock className="h-6 w-6 animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-extrabold text-amber-900 tracking-tight">Action Required</p>
                    <p className="text-xs text-amber-800/80 font-semibold mt-0.5 leading-snug">
                      Complete your profile to start receiving jobs.
                    </p>
                  </div>
                  <div className="flex-shrink-0 bg-amber-900/10 p-2 rounded-lg group-hover:bg-amber-900/20 transition-colors">
                    <FiArrowRight className="h-5 w-5 text-amber-900 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Stats Cards - Outside Gradient */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Card 1: This Month Earnings */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-2xl p-3 relative overflow-hidden cursor-pointer active:scale-95 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-full blur-2xl -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-lg flex-shrink-0 bg-white/60 backdrop-blur-md border border-white/80 shadow-sm group-hover:bg-white/80 transition-colors duration-300"
                  >
                    <FaWallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    <FiTrendingUp className="w-3 h-3 text-emerald-700" />
                    <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">Earnings</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-950 leading-tight tracking-tight mb-0.5">
                    ₹{stats.thisMonthEarnings.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-800/80 font-bold uppercase tracking-widest">This Month</p>
                </div>
              </div>
            </div>

            {/* Card 2: Pending Jobs */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-2xl p-3 relative overflow-hidden cursor-pointer active:scale-95 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-full blur-2xl -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-lg flex-shrink-0 bg-white/60 backdrop-blur-md border border-white/80 shadow-sm group-hover:bg-white/80 transition-colors duration-300"
                  >
                    <FiClock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                    <FiCheckCircle className="w-3 h-3 text-blue-700" />
                    <span className="text-[9px] text-blue-700 font-bold uppercase tracking-wider">Waiting</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-blue-950 leading-tight tracking-tight mb-0.5">
                    {stats.pendingJobs}
                  </p>
                  <p className="text-[10px] text-blue-800/80 font-bold uppercase tracking-widest">Pending Jobs</p>
                </div>
              </div>
            </div>

            {/* Card 3: Accepted Jobs */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-2xl p-3 relative overflow-hidden cursor-pointer active:scale-95 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-full blur-2xl -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-lg flex-shrink-0 bg-white/60 backdrop-blur-md border border-white/80 shadow-sm group-hover:bg-white/80 transition-colors duration-300"
                  >
                    <FiCheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                    <FiBriefcase className="w-3 h-3 text-purple-700" />
                    <span className="text-[9px] text-purple-700 font-bold uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-purple-950 leading-tight tracking-tight mb-0.5">
                    {stats.acceptedJobs}
                  </p>
                  <p className="text-[10px] text-purple-800/80 font-bold uppercase tracking-widest">Accepted</p>
                </div>
              </div>
            </div>

            {/* Card 4: Completed Jobs */}
            <div
              onClick={() => navigate('/worker/jobs')}
              className="rounded-2xl p-3 relative overflow-hidden cursor-pointer active:scale-95 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-full blur-2xl -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-lg flex-shrink-0 bg-white/60 backdrop-blur-md border border-white/80 shadow-sm group-hover:bg-white/80 transition-colors duration-300"
                  >
                    <FiBriefcase className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-teal-500/10 px-1.5 py-0.5 rounded-full border border-teal-500/20">
                    <FiCheckCircle className="w-3 h-3 text-teal-700" />
                    <span className="text-[9px] text-teal-700 font-bold uppercase tracking-wider">Done</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-teal-950 leading-tight tracking-tight mb-0.5">
                    {stats.completedJobs}
                  </p>
                  <p className="text-[10px] text-teal-800/80 font-bold uppercase tracking-widest">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Jobs</h2>
            {recentJobs.length > 0 && (
              <button
                onClick={() => navigate('/worker/jobs')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-95 text-white"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.button} 0%, ${themeColors.button}dd 100%)`,
                  boxShadow: `0 4px 12px ${themeColors.button}40, 0 2px 6px ${themeColors.button}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px ${themeColors.button}50, 0 3px 8px ${themeColors.button}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.button}40, 0 2px 6px ${themeColors.button}30`;
                }}
              >
                View All
              </button>
            )}
          </div>
          {recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job, index) => {
                // Alternating colors
                const isDarkBlue = index % 2 === 0;
                const accentColor = isDarkBlue ? '#001947' : '#406788';

                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/worker/job/${job.id}`)}
                    className="bg-white rounded-xl shadow-lg cursor-pointer active:scale-98 transition-all duration-200 relative overflow-hidden"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {/* Left accent border */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                      style={{
                        background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                      }}
                    />

                    {/* Compact Content */}
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        {/* Profile Image Circle */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                          style={{
                            border: `2.5px solid ${accentColor}40`,
                            boxShadow: `0 2px 8px ${accentColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                            background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
                          }}
                        >
                          <FiUser className="w-5 h-5" style={{ color: accentColor }} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Service in one line */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-sm font-bold text-gray-800 truncate">{job.customerName}</p>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-lg shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                                color: '#FFFFFF',
                                boxShadow: `0 2px 5px ${hexToRgba(accentColor, 0.3)}`,
                              }}
                            >
                              {job.serviceType || 'Service'}
                            </span>
                          </div>

                          {/* Address, Time, Status in one line */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(0, 166, 166, 0.1)',
                                border: '1px solid rgba(0, 166, 166, 0.2)',
                              }}
                            >
                              <FiMapPin className="w-3 h-3" style={{ color: themeColors.button }} />
                              <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{job.location}</span>
                            </div>
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded"
                              style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                              }}
                            >
                              <FiClock className="w-3 h-3" style={{ color: '#F59E0B' }} />
                              <span className="text-xs font-semibold text-gray-700">{job.time}</span>
                            </div>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${accentColor}15`,
                                color: accentColor,
                                border: `1px solid ${accentColor}30`,
                              }}
                            >
                              {getStatusLabel(job.status)}
                            </span>
                          </div>
                        </div>

                        {/* Navigate Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/worker/job/${job.id}`);
                          }}
                          className="p-2 rounded-lg shrink-0 transition-all duration-300 active:scale-95"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                            boxShadow: `0 3px 10px ${hexToRgba(accentColor, 0.3)}, 0 2px 5px ${hexToRgba(accentColor, 0.2)}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = `0 5px 14px ${hexToRgba(accentColor, 0.4)}, 0 3px 7px ${hexToRgba(accentColor, 0.3)}`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = `0 3px 10px ${hexToRgba(accentColor, 0.3)}, 0 2px 5px ${hexToRgba(accentColor, 0.2)}`;
                          }}
                        >
                          <FiArrowRight className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-10 text-center shadow-sm border border-white/50"
              style={{
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                <FiBriefcase className="w-10 h-10 text-slate-400 animate-pulse" />
              </div>
              <p className="text-xl text-slate-800 font-bold mb-2">No jobs assigned yet</p>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[250px] mx-auto">
                You'll see assigned jobs here when vendors assign work to you. Hang tight!
              </p>
            </div>
          )}
        </div>
      </main>


      <WorkerJobAlertModal
        isOpen={!!alertJobId}
        jobId={alertJobId}
        onClose={() => setAlertJobId(null)}
        onJobAccepted={(id) => {
          fetchDashboardData();
          navigate(`/worker/job/${id}`);
        }}
      />


    </div >
  );
};

export default Dashboard;

