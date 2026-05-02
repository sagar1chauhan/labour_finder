import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiTool, FiUser, FiPhone, FiArrowRight, FiCheck, FiMapPin, FiNavigation } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const SKILLS = [
  'Plumbing', 'Electrician', 'Painting', 'Carpentry', 'Mason / Construction',
  'AC / Appliance Repair', 'Cleaning', 'Welding', 'Tiling', 'Gardening',
  'Security Guard', 'Driving', 'Helper / General Labour'
];

const LabourRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, verificationToken } = location.state || {};

  const [form, setForm] = useState({ name: '', skills: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState(null); // {lat, lng}
  const [addressData, setAddressData] = useState(null); // {city, state, ...}
  const [isFetchingLoc, setIsFetchingLoc] = useState(false);

  useEffect(() => {
    if (!phone || !verificationToken) {
      toast.error('Session expired. Please login again.');
      navigate('/labour/login', { replace: true });
    }
  }, [phone, verificationToken, navigate]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setIsFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData({ lat: latitude, lng: longitude });

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const geoData = await geoRes.json();

          if (geoData.status === 'OK' && geoData.results.length > 0) {
            const result = geoData.results[0];
            const getComp = (type) => result.address_components.find(c => c.types.includes(type))?.long_name || '';

            const city = getComp('locality') || getComp('administrative_area_level_2');
            const state = getComp('administrative_area_level_1');
            const area = getComp('sublocality_level_1') || getComp('neighborhood') || getComp('locality');

            setAddressData({
              city,
              state,
              addressLine1: area,
              addressLine2: result.formatted_address
            });
            toast.success(`Detected: ${city}`);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        } finally {
          setIsFetchingLoc(false);
        }
      },
      (err) => {
        toast.error('Location access denied');
        setIsFetchingLoc(false);
      }
    );
  };

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    if (form.skills.length === 0) { toast.error('Please select at least one skill'); return; }

    setIsLoading(true);
    try {
      const res = await api.post('/workers/auth/register', {
        name: form.name.trim(),
        phone,
        verificationToken,
        serviceCategories: form.skills,
        location: locationData,
        address: addressData
      });

      if (res.data.success) {
        // Store tokens if returned
        if (res.data.accessToken) {
          localStorage.setItem('labourAccessToken', res.data.accessToken);
          localStorage.setItem('labourRefreshToken', res.data.refreshToken);
          localStorage.setItem('labourData', JSON.stringify(res.data.worker || {}));
        }
        toast.success('Registered successfully! Welcome aboard.');
        navigate('/labour/dashboard', { replace: true });
      } else {
        toast.error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-teal-400 opacity-[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400 opacity-[0.05] rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-teal-200">
            <FiTool className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Create Labour Account</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">Setup your profile to start receiving booking requests</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <FiPhone className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-black text-teal-700">+91 {phone}</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/60 p-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 rounded-t-[2.5rem]" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Your Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Raju Sharma"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all font-bold text-sm"
                />
              </div>
            </div>

            {/* Location Detection */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
              <label className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-2 block">Service Location</label>
              <button 
                type="button"
                onClick={handleDetectLocation}
                disabled={isFetchingLoc}
                className="w-full flex items-center justify-between bg-white border border-teal-200 p-3 rounded-xl shadow-sm active:scale-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-900">{addressData ? addressData.city : 'Detect Location'}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{addressData ? addressData.state : 'For better job matching'}</p>
                  </div>
                </div>
                {isFetchingLoc ? (
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiNavigation className="w-4 h-4 text-teal-400" />
                )}
              </button>
            </div>

            {/* Skills */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">
                Your Skills * <span className="text-gray-300 normal-case font-bold">(Select all)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => {
                  const selected = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center gap-1.5 border ${
                        selected
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-md shadow-teal-200 scale-[1.02]'
                          : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      {selected && <FiCheck className="w-3 h-3" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
              {form.skills.length > 0 && (
                <p className="text-xs text-teal-600 font-black mt-3 flex items-center gap-1">
                  <FiCheck className="w-4 h-4" /> {form.skills.length} skills selected
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-xl shadow-teal-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              ) : (
                <>Start Working <FiArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LabourRegister;
