import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiLogOut, FiArrowLeft, FiX } from 'react-icons/fi';
import Logo from '../../../../components/common/Logo';
import { themeColors } from '../../../../theme';
import { getRegistrationStatus } from '../../services/authService';

const PendingApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRejected = location.state?.status === 'REJECTED' || location.state?.status === 'rejected' || location.state?.rejected;
  const reason = location.state?.reason || 'Your application did not meet our requirements.';
  
  const brandColor = themeColors.brand?.teal || '#cfdc01';

  useEffect(() => {
    const checkStatus = async () => {
      const vendorId = sessionStorage.getItem('pendingVendorId');
      if (!vendorId || isRejected) return;

      try {
        const response = await getRegistrationStatus(vendorId);
        if (response.success) {
          const pv = response.policeVerification;
          const method = pv?.method?.toLowerCase();
          const status = pv?.status?.toLowerCase();

          // If they reach this page but still need to choose or upload, redirect them
          if (!method) {
            navigate('/vendor/police-verification/selection', { state: { vendorId } });
          } else if (method === 'self' && status === 'pending') {
            navigate('/vendor/police-verification/upload', { state: { vendorId } });
          } else if (response.approvalStatus?.toLowerCase() === 'approved') {
            if (!response.isSubscriptionActive) {
              navigate('/vendor/subscription', { state: { vendorId } });
            } else {
              navigate('/vendor/dashboard');
            }
          }
          // Otherwise, stay on this page (it's either admin method or already submitted)
        }
      } catch (error) {
        console.error('Failed to check vendor status:', error);
      }
    };

    checkStatus();
  }, [navigate, isRejected]);

  const handleBackToLogin = () => {
    // Clear any temporary tokens if they exist
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
    sessionStorage.removeItem('pendingVendorId');
    navigate('/vendor/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#cfdc01] opacity-[0.03] rounded-full blur-3xl animate-floating" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a2ad02] opacity-[0.03] rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <Logo className="h-20 w-auto mx-auto transform hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-12 px-8 shadow-2xl shadow-gray-200/50 sm:rounded-3xl border border-gray-100 relative overflow-hidden animate-slide-in-bottom">
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${isRejected ? 'from-red-500 to-orange-500' : 'from-[#cfdc01] via-[#a2ad02] to-[#b6c200]'}`} />
          
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-6 animate-bounce-subtle ${isRejected ? 'bg-red-50' : 'bg-orange-50'}`}>
              {isRejected ? (
                <FiX className="h-12 w-12 text-red-500" />
              ) : (
                <FiClock className="h-12 w-12 text-[#a2ad02]" />
              )}
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {isRejected ? 'Application Rejected' : 'Registration Under Review'}
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {isRejected 
                ? "We regret to inform you that your application has been rejected."
                : "Your application is currently being verified by our team. You'll be able to access your dashboard once your account is approved."}
            </p>

            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isRejected ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                <p className={`text-sm ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>
                  {isRejected ? (
                    <><strong>Reason:</strong> {reason}</>
                  ) : (
                    <>Approval usually takes <strong>24-48 hours</strong>. We will notify you once it's complete.</>
                  )}
                </p>
              </div>

              <button
                onClick={handleBackToLogin}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-white transition-all transform hover:-translate-y-1 shadow-lg overflow-hidden"
                style={{ 
                  backgroundColor: brandColor,
                  boxShadow: `0 10px 15px -3px ${brandColor}4D` 
                }}
              >
                <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Need help? <a href="mailto:support@civilconnect.in" className="font-bold text-[#cfdc01] hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;
