import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';
import { userAuthService } from '../../../services/authService';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userAuthService.register(formData);
      if (res.success) {
        toast.success('Account created successfully!');
        navigate('/user/login');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 pt-12 pb-10 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-48 bg-[#0D9488] rounded-b-[40px] shadow-2xl shadow-teal-900/10" />
      
      <div className="absolute top-6 left-6 z-20">
         <button 
           onClick={() => navigate(-1)}
           className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
         >
            <FiArrowLeft className="w-5 h-5" />
         </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10 mt-6"
      >
        <div className="text-center mb-8">
           <h1 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">Create Account</h1>
           <p className="text-teal-50 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Join our premium service</p>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  <input 
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 rounded-xl border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  <input 
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 rounded-xl border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  <input 
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 rounded-xl border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 rounded-xl border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500/20 placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-[#0D9488] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-teal-100 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center py-2">
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                By signing up, you agree to our <span className="text-teal-600">Terms</span> & <span className="text-teal-600">Privacy</span>.
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Already a member? <Link to="/user/login" className="text-teal-600 font-black hover:underline">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
