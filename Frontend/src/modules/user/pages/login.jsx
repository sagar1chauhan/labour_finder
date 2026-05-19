import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
 FiPhone,
 FiArrowRight,
 FiArrowLeft,
 FiEdit3,
 FiRotateCw,
 FiShield,
 FiHome,
 FiCompass,
 FiBriefcase,
 FiTool,
 FiDroplet,
 FiZap,
 FiGrid,
 FiSmartphone
} from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import { userAuthService } from '../../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
 const navigate = useNavigate();
 const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'name' | 'usage'
 const [phone, setPhone] = useState('');
 const [otp, setOtp] = useState(['', '', '', '', '', '']);
 const [loading, setLoading] = useState(false);
 const [resendTimer, setResendTimer] = useState(0);

 // New user onboarding states
 const [fullName, setFullName] = useState('');
 const [selectedRole, setSelectedRole] = useState('');
 const [verificationToken, setVerificationToken] = useState('');

 const phoneInputRef = useRef(null);
 const nameInputRef = useRef(null);
 const otpInputRefs = useRef([]);

 // Usage selection options with description and icons
 const usageOptions = [
 { id: 'Home Owner', label: 'Home Owner', desc: 'Hire professionals & book services', icon: FiHome },
 { id: 'Architect', label: 'Architect', desc: 'Designing, mapping & planning structures', icon: FiCompass },
 { id: 'Contractor', label: 'Contractor', desc: 'Building, civil & construction works', icon: FiBriefcase },
 { id: 'Carpenter', label: 'Carpenter', desc: 'Furniture, kitchen & woodwork jobs', icon: FiTool },
 { id: 'Plumber', label: 'Plumber', desc: 'Pipes, leaks, fittings & bathrooms', icon: FiDroplet },
 { id: 'Electrician', label: 'Electrician', desc: 'Wiring, switches & lightning panels', icon: FiZap },
 { id: 'Flooring', label: 'Flooring', desc: 'Tiles, marble & adhesive specialist', icon: FiGrid }
 ];

 // Auto focus phone input on mount
 useEffect(() => {
 if (step === 'phone' && phoneInputRef.current) {
 setTimeout(() => phoneInputRef.current.focus(), 150);
 }
 }, [step]);

 // Auto focus name input when entering the name step
 useEffect(() => {
 if (step === 'name' && nameInputRef.current) {
 setTimeout(() => nameInputRef.current.focus(), 150);
 }
 }, [step]);

 // Countdown timer for Resend OTP
 useEffect(() => {
 let interval;
 if (resendTimer > 0) {
 interval = setInterval(() => {
 setResendTimer((prev) => prev - 1);
 }, 1000);
 }
 return () => clearInterval(interval);
 }, [resendTimer]);

 // Auto trigger verify when full 6-digit OTP is entered
 useEffect(() => {
 const otpValue = otp.join('');
 if (otpValue.length === 6 && !loading && step === 'otp') {
 handleVerifyOtp();
 }
 }, [otp]);

 const handleSendOtp = async (e) => {
 if (e) e.preventDefault();

 if (phone.length < 10) {
 toast.error('Enter a valid 10-digit mobile number');
 return;
 }
 setLoading(true);
 try {
 const res = await userAuthService.sendOTP(phone);
 if (res.success) {
 setStep('otp');
 setResendTimer(60);
 toast.success('OTP sent successfully');
 setOtp(['', '', '', '', '', '']);
 setTimeout(() => {
 otpInputRefs.current[0]?.focus();
 }, 150);
 } else {
 toast.error(res.message || 'Failed to send OTP');
 }
 } catch (err) {
 toast.error('Network error. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const handleVerifyOtp = async (e) => {
 if (e) e.preventDefault();
 const otpValue = otp.join('');
 if (otpValue.length < 6) {
 toast.error('Enter full 6-digit OTP');
 return;
 }
 setLoading(true);
 try {
 const res = await userAuthService.verifyLogin({ phone, otp: otpValue });
 if (res.success) {
 if (res.isNewUser) {
 // Store token and move to Name entry step
 setVerificationToken(res.verificationToken);
 setStep('name');
 toast.success('Number verified! Let\'s set up your profile.');
 } else {
 toast.success('Login successful!');
 navigate('/user');
 }
 } else {
 toast.error(res.message || 'Invalid OTP');
 }
 } catch (err) {
 toast.error('Verification failed');
 } finally {
 setLoading(false);
 }
 };

 const handleNameSubmit = (e) => {
 if (e) e.preventDefault();
 if (!fullName.trim()) {
 toast.error('Please enter your full name');
 return;
 }
 setStep('usage');
 };

 const handleRegisterSubmit = async (e) => {
 if (e) e.preventDefault();
 if (!selectedRole) {
 toast.error('Please choose how you will use Civil Connect');
 return;
 }
 setLoading(true);
 try {
 const res = await userAuthService.register({
 name: fullName.trim(),
 verificationToken,
 usageRole: selectedRole
 });
 if (res.success) {
 toast.success('Welcome to Civil Connect!');
 navigate('/user');
 } else {
 toast.error(res.message || 'Registration failed');
 }
 } catch (err) {
 toast.error('Failed to complete onboarding');
 } finally {
 setLoading(false);
 }
 };

 const handleOtpChange = (value, index) => {
 const cleanValue = value.replace(/\D/g, '').slice(0, 1);
 const newOtp = [...otp];
 newOtp[index] = cleanValue;
 setOtp(newOtp);

 // Auto focus next field
 if (cleanValue && index < 5) {
 otpInputRefs.current[index + 1]?.focus();
 }
 };

 const handleOtpKeyDown = (index, e) => {
 if (e.key === 'Backspace' && !otp[index] && index > 0) {
 otpInputRefs.current[index - 1]?.focus();
 }
 };

 const isPhoneValid = phone.length === 10;
 const isNameValid = fullName.trim().length > 0;

 return (
 <div className="min-h-screen bg-white flex flex-col justify-between px-6 pt-4 pb-8 relative overflow-hidden font-['Inter',sans-serif]">
 {/* Top Header Section */}
 <div className="flex items-center justify-start w-full h-12 relative z-20">
 {!['phone', 'otp'].includes(step) && (
 <button
 onClick={() => {
 if (step === 'otp') setStep('phone');
 else if (step === 'name') setStep('otp');
 else if (step === 'usage') setStep('name');
 }}
 className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors active:scale-90 shadow-sm"
 >
 <FiArrowLeft className="w-5 h-5" />
 </button>
 )}
 </div>

 {/* Main Form content wrapper centered */}
 <div className={`flex-1 flex flex-col max-w-md w-full mx-auto relative z-10 my-4 ${step !== 'phone' ? 'justify-start mt-4' : 'justify-center'}`}>

 {/* Branding Logo - Displayed only for phone and OTP steps */}
 {step === 'phone' && (
 <div className="flex flex-col items-center mb-8">
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.5, ease: 'easeOut' }}
 className="flex items-center gap-1.5 select-none"
 >
 <span className="text-[#1F2937] font-bold text-5xl tracking-tighter font-['Outfit',sans-serif] lowercase flex items-center">
 Civil<span className="text-[#cfdc01]">Connect</span>
 </span>
 </motion.div>
 <p className="text-gray-400 text-sm font-semibold tracking-wide mt-4 ">
 Sign up or Log in
 </p>
 </div>
 )}

 {/* Dynamic step container */}
 <AnimatePresence mode="wait">
 {step === 'phone' ? (
 <motion.div
 key="phone-step"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3 }}
 className="w-full space-y-6"
 >
 <form onSubmit={handleSendOtp} className="space-y-5">
 <div className="space-y-2">
 <div className="flex items-center border border-gray-200/90 focus-within:border-[#cfdc01] focus-within:ring-2 focus-within:ring-[#cfdc01]/10 rounded-2xl p-1 bg-white transition-all shadow-sm">
 <div className="flex items-center px-4">
 <span className="text-gray-900 font-semibold text-base tracking-wide">+91</span>
 </div>
 <div className="h-6 w-px bg-gray-200"></div>
 <input
 ref={phoneInputRef}
 type="tel"
 required
 maxLength="10"
 placeholder="635584264"
 value={phone}
 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
 className="w-full px-4 py-4 border-none outline-none focus:ring-0 text-base font-semibold text-gray-900 placeholder:text-gray-300 tracking-wider"
 />
 </div>
 <p className="text-[11px] text-gray-400 font-medium ml-2">We'll send a 6-digit OTP for secure authentication.</p>
 </div>

 <button
 type="submit"
 disabled={loading}
 className={`w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${isPhoneValid
 ? 'bg-[#cfdc01] text-[#0f172a] hover:bg-[#b6c200] active:scale-[0.98] shadow-[#cfdc01]/10'
 : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
 }`}
 >
 {loading ? 'Processing...' : 'Continue'}
 {!loading && <FiArrowRight className="w-5 h-5" />}
 </button>
 </form>


 </motion.div>
 ) : step === 'otp' ? (
 <motion.div
 key="otp-step"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3 }}
 className="w-full space-y-6"
 >
 <div className="flex items-center relative mb-4">
 <button
 onClick={() => setStep('phone')}
 className="absolute left-0 p-1 text-gray-800"
 >
 <FiArrowLeft className="w-6 h-6" />
 </button>
 <h2 className="text-[22px] font-bold text-[#0f172a] w-full text-center tracking-tight">Verify Your Number</h2>
 </div>

 <div className="flex justify-center my-8">
 <div className="w-[120px] h-[120px] bg-[#cfdc01]/10 rounded-full flex items-center justify-center">
 <FiSmartphone className="w-12 h-12 text-[#cfdc01]" strokeWidth={2} />
 </div>
 </div>

 <div className="text-center space-y-3 mb-6">
 <p className="text-[15px] text-gray-500 font-medium tracking-wide">We've sent a verification code to</p>
 <p className="text-xl font-bold text-[#0f172a]">+91 {phone}</p>
 </div>

 <form onSubmit={handleVerifyOtp} className="space-y-8">
 <div className="flex justify-center gap-3">
 {otp.map((digit, i) => (
 <div key={i} className="relative w-12 h-14 flex items-center justify-center bg-white rounded-xl">
 <input
 ref={(el) => (otpInputRefs.current[i] = el)}
 type="tel"
 maxLength="1"
 value={digit}
 onChange={(e) => handleOtpChange(e.target.value, i)}
 onKeyDown={(e) => handleOtpKeyDown(i, e)}
 className={`peer absolute inset-0 w-full h-full rounded-xl border-2 text-center text-xl font-semibold transition-all outline-none bg-transparent caret-transparent z-10 ${
 digit || (document.activeElement === otpInputRefs.current[i])
 ? 'border-[#cfdc01] text-[#0f172a]'
 : 'border-gray-200 text-[#0f172a] focus:border-[#cfdc01]'
 }`}
 />
 {!digit && (
 <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[18px] h-[3px] bg-[#cfdc01] rounded-full hidden peer-focus:block animate-pulse pointer-events-none z-0"></div>
 )}
 </div>
 ))}
 </div>

 <div className="space-y-4">
 <button
 type="submit"
 disabled={loading || otp.join('').length < 6}
 className={`w-full h-14 rounded-2xl font-bold text-[17px] transition-all duration-300 flex items-center justify-center gap-2 ${
 otp.join('').length === 6
 ? 'bg-[#cfdc01] text-white hover:bg-[#b6c200] active:scale-[0.98]'
 : 'bg-[#cfdc01] text-white opacity-70 cursor-not-allowed shadow-none'
 }`}
 >
 {loading ? 'Fetching OTP...' : (otp.join('').length < 6 ? 'Fetching OTP...' : 'Verify & Continue')}
 </button>
 
 <button
 type="button"
 disabled={resendTimer > 0}
 onClick={handleSendOtp}
 className={`w-full flex items-center justify-center gap-2 text-sm font-semibold tracking-wide ${resendTimer > 0 ? 'text-gray-400' : 'text-[#cfdc01]'}`}
 >
 {resendTimer > 0
 ? `Resend in ${resendTimer}s`
 : <><FiRotateCw className="w-4 h-4" /> Resend OTP</>}
 </button>
 </div>
 </form>
 </motion.div>
 ) : step === 'name' ? (
 <motion.div
 key="name-step"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3 }}
 className="w-full space-y-6"
 >
 <div className="space-y-1">
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Your Account</h2>
 <p className="text-xs font-medium text-gray-400">Please provide your details to continue</p>
 </div>

 <form onSubmit={handleNameSubmit} className="space-y-6">
 <div className="space-y-2">
 <label className="text-xs font-bold text-gray-500 tracking-wider block ml-1">
 Full Name *
 </label>
 <div className="flex items-center border border-gray-200/90 focus-within:border-[#cfdc01] focus-within:ring-2 focus-within:ring-[#cfdc01]/10 rounded-2xl p-1 bg-white transition-all shadow-sm">
 <input
 ref={nameInputRef}
 type="text"
 required
 placeholder="Shiv"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 className="w-full px-4 py-4 border-none outline-none focus:ring-0 text-base font-semibold text-gray-900 placeholder:text-gray-300"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={!isNameValid}
 className={`w-full h-14 rounded-2xl font-bold text-base transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${isNameValid
 ? 'bg-[#cfdc01] text-[#0f172a] hover:bg-[#b6c200] active:scale-[0.98]'
 : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
 }`}
 >
 Continue
 <FiArrowRight className="w-5 h-5" />
 </button>

 <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed max-w-xs mx-auto">
 By continuing, you agree to our <span className="text-[#cfdc01] cursor-pointer hover:underline">Terms of Service</span> & <span className="text-[#cfdc01] cursor-pointer hover:underline">Privacy Policy</span>.
 </p>
 </form>
 </motion.div>
 ) : (
 <motion.div
 key="usage-step"
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3 }}
 className="w-full flex-1 flex flex-col"
 >
 <div className="space-y-1 shrink-0 mb-6">
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How will you use Civil Connect?</h2>
 <p className="text-xs font-medium text-gray-400">Choose your primary account type</p>
 </div>

 <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin min-h-0 mb-4 pb-2">
 {usageOptions.map((opt) => {
 const Icon = opt.icon;
 const isSelected = selectedRole === opt.id;
 return (
 <div
 key={opt.id}
 onClick={() => setSelectedRole(opt.id)}
 className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
 ? 'border-[#cfdc01] bg-[#cfdc01]/20'
 : 'border-gray-100 hover:border-gray-200 bg-white'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#cfdc01] text-white' : 'bg-gray-50 text-gray-500'
 }`}>
 <Icon className="w-4 h-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-gray-900 tracking-tight">{opt.label}</p>
 <p className="text-[9px] font-bold text-gray-400 mt-0.5 tracking-wide">{opt.desc}</p>
 </div>
 </div>
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'border-[#cfdc01] bg-white' : 'border-gray-200 bg-white'
 }`}>
 {isSelected && (
 <div className="w-2.5 h-2.5 rounded-full bg-[#cfdc01]" />
 )}
 </div>
 </div>
 );
 })}
 </div>

 <div className="shrink-0 mt-auto pt-4 pb-2 bg-white relative z-20">
 <button
 onClick={handleRegisterSubmit}
 disabled={loading || !selectedRole}
 className={`w-full h-14 rounded-2xl font-bold text-[17px] transition-all duration-300 flex items-center justify-center gap-2 ${selectedRole
 ? 'bg-[#cfdc01] text-[#0f172a] hover:bg-[#b6c200] active:scale-[0.98]'
 : 'bg-[#cfdc01]/60 text-white cursor-not-allowed shadow-none'
 }`}
 >
 {loading ? 'Completing registration...' : 'Continue'}
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Footer / Onboarding Route Links */}
 {(step === 'phone' || step === 'otp') && (
 <div className="w-full text-center space-y-4 pt-4 relative z-10 border-t border-gray-100/60 max-w-md mx-auto">
 <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold tracking-wide ">
 <FiShield className="w-4 h-4 text-[#cfdc01]" />
 <span>Secure AES Encrypted Connection</span>
 </div>
 <p className="text-xs font-semibold text-gray-400 tracking-wider">
 New here? <Link to="/user/signup" className="text-[#cfdc01] font-bold hover:underline tracking-widest ml-1">Create Account</Link>
 </p>
 </div>
 )}
 {(step === 'name' || step === 'usage') && (
 <div className="w-full text-center space-y-4 pt-4 relative z-10 border-t border-gray-100/60 max-w-md mx-auto">
 <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold tracking-wide ">
 <FiShield className="w-4 h-4 text-[#cfdc01]" />
 <span>Step {step === 'name' ? '1 of 2' : '2 of 2'} - Set up Profile</span>
 </div>
 </div>
 )}
 </div>
 );
};

export default Login;
