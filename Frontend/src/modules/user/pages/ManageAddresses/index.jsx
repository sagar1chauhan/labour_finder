import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiMapPin, FiNavigation } from 'react-icons/fi';
import AddressSelectionModal from '../Checkout/components/AddressSelectionModal';
import { userAuthService } from '../../../../services/authService';

import { z } from "zod";

// Zod schema for Address validation
const addressSchema = z.object({
  addressLine1: z.string().min(5, "Address location is too short"),
  addressLine2: z.string().optional(), // House Number
  city: z.string().min(2, "City name is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid Pincode format"),
});

const ManageAddresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]); // Stores Red raw DB address objects
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [houseNumber, setHouseNumber] = useState('');

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await userAuthService.getProfile();
      if (response.success && response.user?.addresses) {
        setAddresses(response.user.addresses);
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };


  const handleAddAddress = () => {
    setEditingAddress(null);
    setHouseNumber('');
    setShowAddModal(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setHouseNumber(address.addressLine2 || '');
    setShowMenu(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
    setHouseNumber('');
  };

  const getComponent = (components, type) => {
    return components?.find(c => c.types.includes(type))?.long_name || '';
  };

  const handleSaveAddress = async (savedHouseNumber, locationObj) => {
    try {
      if (!locationObj) {
        toast.error('Please select a location on the map');
        return;
      }

      // Extract details
      const components = locationObj.components || [];
      const city = getComponent(components, 'locality') || getComponent(components, 'administrative_area_level_2') || '';
      const state = getComponent(components, 'administrative_area_level_1') || '';
      const pincode = getComponent(components, 'postal_code') || '';

      // Zod Validation Preparation
      const addressData = {
        addressLine1: locationObj.address,
        addressLine2: savedHouseNumber,
        city,
        state,
        pincode
      };

      const validationResult = addressSchema.safeParse(addressData);
      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        return;
      }

      const newAddress = {
        type: 'home', // Default type
        ...addressData,
        lat: locationObj.lat,
        lng: locationObj.lng,
        isDefault: addresses.length === 0 // Make first address default
      };

      // ENFORCE SINGLE ADDRESS: Replace existing if adding new
      const updatedAddresses = [newAddress];

      // Call API
      toast.loading('Saving address...');
      const response = await userAuthService.updateProfile({ addresses: updatedAddresses });
      toast.dismiss();

      if (response.success) {
        setAddresses(response.user.addresses || updatedAddresses);
        toast.success(editingAddress ? 'Address updated!' : 'Address added!');
        handleCloseModal();
      } else {
        toast.error(response.message || 'Failed to save address');
      }

    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (addressId) => {
    try {
      const updatedAddresses = addresses.filter(addr => (addr._id || addr.id) !== addressId);

      toast.loading('Deleting address...');
      const response = await userAuthService.updateProfile({ addresses: updatedAddresses });
      toast.dismiss();

      if (response.success) {
        setAddresses(response.user.addresses || updatedAddresses);
        setShowMenu(null);
        toast.success('Address deleted successfully!');
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete address');
    }
  };

  const handleMenuToggle = (addressId) => {
    setShowMenu(showMenu === addressId ? null : addressId);
  };

  // Helper to format address for display
  const formatAddress = (addr) => {
    const parts = [
      addr.addressLine2,
      addr.addressLine1,
      addr.city,
      addr.state,
      addr.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen pb-24 relative" style={{ backgroundColor: '#fbfde8' }}>
      {/* Header */}
      <header 
        className="px-6 pt-5 pb-4 rounded-b-[24px] shadow-md shadow-gray-200/50 sticky top-0 z-50"
        style={{ background: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 border border-white/20 active:scale-90 transition-all"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase">Manage Addresses</h1>
              <p className="text-[8px] font-bold text-gray-800 uppercase tracking-[0.2em] opacity-80 leading-none mt-0.5">Your Locations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        {/* Saved Addresses Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Saved Address</h2>
          {addresses.length === 0 && (
            <button
              onClick={handleAddAddress}
              className="flex items-center gap-1.5 text-[9px] font-black text-[#889400] uppercase tracking-widest bg-white border border-[#889400]/20 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Address
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && addresses.length === 0 && (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#889400] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Loading your addresses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && addresses.length === 0 && (
          <div className="py-12 text-center bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-sm">
            <FiMapPin className="w-12 h-12 text-[#889400] mx-auto mb-3" />
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No saved addresses yet</p>
          </div>
        )}

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id || address.id}
              className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 flex flex-col relative"
            >
              {/* Menu Button */}
              <button
                onClick={() => handleMenuToggle(address._id || address.id)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiMoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Menu Dropdown */}
              {showMenu === (address._id || address.id) && (
                <div className="absolute top-12 right-4 bg-white border border-gray-50 rounded-2xl shadow-xl z-10 min-w-[120px] overflow-hidden">
                  <button
                    onClick={() => handleEdit(address)}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-xs font-bold text-gray-700 border-b border-gray-50"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-gray-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(address._id || address.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-xs font-bold text-red-600"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              {/* Address Content */}
              <div className="pr-12">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-2 py-0.5 bg-[#889400]/10 rounded text-[8px] font-black uppercase text-[#889400] tracking-widest">
                    {address.type || 'HOME'}
                  </span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[8px] font-black uppercase tracking-widest shadow-sm">
                      Default
                    </span>
                  )}
                </div>
                <h3 className="text-[11px] font-black text-gray-900 leading-tight mb-1.5">
                  {address.addressLine2 ? `${address.addressLine2}, ` : ''}{address.addressLine1}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Address Selection Modal (Reuse from Checkout) */}
      <AddressSelectionModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        houseNumber={houseNumber}
        onHouseNumberChange={setHouseNumber}
        onSave={handleSaveAddress}
      />

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(null)}
        />
      )}
    </div>
  );
};

export default ManageAddresses;

