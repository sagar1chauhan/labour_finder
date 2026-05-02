import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMapPin, FiBriefcase, FiEdit2, FiCheck, FiX, FiCamera, FiArrowLeft, FiLogOut, FiNavigation } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../../services/api';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map
const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 15);
  }, [coords, map]);
  return null;
};

const LabourProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState(null); // {lat, lng}
  const [fetchingLoc, setFetchingLoc] = useState(false);
  
  const token = localStorage.getItem('labourAccessToken');

  useEffect(() => {
    if (!token) {
      navigate('/labour/login', { replace: true });
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/labour/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProfile(res.data.labour);
        setEditData({
          name: res.data.labour.name,
          phone: res.data.labour.phone,
          serviceCategories: res.data.labour.serviceCategories || []
        });
        if (res.data.labour.location?.lat) {
          setLocation({
            lat: res.data.labour.location.lat,
            lng: res.data.labour.location.lng
          });
        }
      }
    } catch (err) {
      console.error('[Labour Profile] Fetch error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editData.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editData.phone?.trim() || editData.phone.length < 10) {
      toast.error('Valid phone number is required');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/workers/profile', editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Profile updated successfully');
        setProfile(res.data.worker);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    setFetchingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude };
        setLocation(newLoc);
        
        try {
          // 1. Get Address using Google Geocoding API (same as User side)
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const geoData = await geoRes.json();
          
          let addressData = null;
          if (geoData.status === 'OK' && geoData.results.length > 0) {
            const result = geoData.results[0];
            const getComp = (type) => result.address_components.find(c => c.types.includes(type))?.long_name || '';
            
            const city = getComp('locality') || getComp('administrative_area_level_2');
            const state = getComp('administrative_area_level_1');
            const area = getComp('sublocality_level_1') || getComp('neighborhood') || getComp('locality');
            
            addressData = {
              city,
              state,
              addressLine1: area,
              addressLine2: result.formatted_address
            };
          }

          // 2. Save both Coordinates and Address to server
          const updatePromises = [
            api.put('/workers/profile/location', newLoc, { headers: { Authorization: `Bearer ${token}` } })
          ];
          
          if (addressData) {
            updatePromises.push(
              api.put('/workers/profile', { address: addressData }, { headers: { Authorization: `Bearer ${token}` } })
            );
          }

          await Promise.all(updatePromises);
          
          if (addressData) {
            setProfile(prev => ({ ...prev, address: addressData }));
          }
          toast.success('Live location and address updated!');
        } catch (err) {
          console.error('Location sync error:', err);
          toast.error('Failed to sync location to server');
        } finally {
          setFetchingLoc(false);
        }
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Failed to get location. Please allow GPS access.');
        setFetchingLoc(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('labourAccessToken');
    localStorage.removeItem('labourRefreshToken');
    navigate('/labour/login', { replace: true });
    toast.success('Logged out');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-[1001] bg-gradient-to-r from-teal-500 to-emerald-600 px-4 pt-12 pb-16 relative overflow-hidden shadow-lg shadow-teal-900/10">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">Your Profile</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-rose-500/20 text-rose-100 rounded-xl hover:bg-rose-500/30 transition flex items-center gap-2"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Logout</span>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-[10]">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-teal-900/5 p-6 mb-4 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4 group">
              {profile?.profilePhoto ? (
                <img 
                  src={profile.profilePhoto} 
                  alt={profile.name} 
                  className="w-24 h-24 rounded-[2rem] object-cover border-4 border-teal-50 shadow-inner"
                />
              ) : (
                <div className="w-24 h-24 rounded-[2rem] bg-teal-50 flex items-center justify-center border-4 border-teal-50">
                  <span className="text-4xl font-black text-teal-600">{profile?.name?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-teal-600">
                <FiCamera className="w-4 h-4" />
              </div>
            </div>

            {isEditing ? (
              <div className="w-full space-y-3">
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    placeholder="Full Name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    value={editData.phone}
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    placeholder="Phone Number"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 bg-teal-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiCheck /> Save Changes</>}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 bg-gray-100 text-gray-500 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{profile?.name}</h2>
                <p className="text-gray-400 text-sm font-bold mt-0.5 tracking-tight">+91 {profile?.phone}</p>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-6 py-2.5 bg-teal-50 text-teal-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-teal-100 transition-colors active:scale-95"
                >
                  <FiEdit2 className="w-3 h-3" /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="p-5 pb-3 flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Live Location</p>
                    <h3 className="text-sm font-black text-gray-900 mt-0.5">Current Work Area</h3>
                </div>
                <button 
                    onClick={fetchLiveLocation}
                    disabled={fetchingLoc}
                    className="p-3 bg-teal-500 text-white rounded-2xl shadow-lg shadow-teal-200 active:scale-90 transition-all disabled:opacity-50"
                >
                    {fetchingLoc ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiNavigation className="w-4 h-4" />}
                </button>
            </div>
            
            <div className="h-48 w-full relative z-0">
                {location ? (
                    <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[location.lat, location.lng]} />
                        <RecenterMap coords={[location.lat, location.lng]} />
                    </MapContainer>
                ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center flex-col p-6 text-center">
                        <FiMapPin className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Location not available</p>
                        <button onClick={fetchLiveLocation} className="text-[10px] font-black text-teal-600 mt-2 uppercase underline">Get Live Location</button>
                    </div>
                )}
            </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Primary Skills</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile?.serviceCategories?.length > 0 ? profile.serviceCategories.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-lg border border-indigo-100 uppercase tracking-wide">
                    {s}
                  </span>
                )) : <span className="text-sm font-bold text-gray-400">No skills added</span>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Service Area</p>
              <p className="text-sm font-bold text-gray-700 mt-0.5">
                {profile?.address?.city || 'Indore'}, {profile?.address?.state || 'MP'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourProfile;
