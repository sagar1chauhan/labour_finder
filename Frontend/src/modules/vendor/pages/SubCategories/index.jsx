import React, { useState, useEffect } from 'react';
import { FiGrid, FiPlus, FiImage, FiX, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { vendorTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { uploadToCloudinary } from '../../../../utils/cloudinaryUpload';
import LogoLoader from '../../../../components/common/LogoLoader';

const VendorSubCategoriesPage = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    iconUrl: ''
  });

  const brandColor = themeColors.brand?.teal || '#cfdc01';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subCatRes, catRes] = await Promise.all([
        api.get('/vendors/sub-categories'),
        api.get('/vendors/categories')
      ]);
      if (subCatRes.data.success) setSubCategories(subCatRes.data.subCategories || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sub-category?')) return;
    try {
      const res = await api.delete(`/vendors/sub-categories/${id}`);
      if (res.data.success) {
        toast.success('Deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.categoryId) {
      return toast.error('Please fill all required fields');
    }
    try {
      setIsSubmitting(true);
      let iconUrl = form.iconUrl;
      if (imageFile) {
        toast.loading('Uploading icon...', { id: 'upload-subcat' });
        setUploadingIcon(true);
        iconUrl = await uploadToCloudinary(imageFile, 'subcategories');
        toast.dismiss('upload-subcat');
        setUploadingIcon(false);
      }
      const res = await api.post('/vendors/sub-categories', { ...form, iconUrl });
      if (res.data.success) {
        toast.success('Sub-Category created!');
        setIsModalOpen(false);
        setForm({ title: '', categoryId: '', iconUrl: '' });
        setImageFile(null);
        setImagePreview('');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create sub-category');
    } finally {
      setIsSubmitting(false);
      setUploadingIcon(false);
    }
  };

  const filteredSubCategories = selectedCategory === 'all'
    ? subCategories
    : subCategories.filter(s => {
        const catId = s.categoryId?._id || s.categoryId;
        return String(catId) === String(selectedCategory);
      });

  if (loading) return <LogoLoader />;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f8f9fa' }}>
      <Header title="Sub-Categories" />

      <div className="px-4 pt-4 pb-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-black text-gray-900">My Sub-Categories</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage your product sub-categories</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white shadow-sm active:scale-95 transition-all"
            style={{ backgroundColor: brandColor }}
          >
            <FiPlus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
            style={selectedCategory === 'all' ? { backgroundColor: brandColor } : {}}
          >
            All
          </button>
          {categories.filter(c => c.categoryType === 'product').map(cat => {
            const catId = cat._id || cat.id;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === catId
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
                style={selectedCategory === catId ? { backgroundColor: brandColor } : {}}
              >
                {cat.title}
              </button>
            );
          })}
        </div>

        {/* Sub-Category Grid */}
        {filteredSubCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiGrid className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-400">No sub-categories yet</p>
            <p className="text-xs text-gray-300 mt-1">Tap "Add New" to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredSubCategories.map(sub => (
              <div
                key={sub._id}
                className="bg-white rounded-2xl p-3 flex flex-col items-center shadow-sm border border-gray-100 relative"
              >
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="absolute top-2 right-2 w-5 h-5 bg-red-50 rounded-full flex items-center justify-center"
                >
                  <FiTrash2 className="w-2.5 h-2.5 text-red-400" />
                </button>
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                  {sub.iconUrl ? (
                    <img src={sub.iconUrl} alt={sub.title} className="w-full h-full object-contain" />
                  ) : (
                    <FiImage className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <p className="text-[10px] font-black text-gray-800 text-center uppercase tracking-tight leading-tight line-clamp-2">{sub.title}</p>
                <span className="text-[8px] text-gray-400 mt-1 text-center">{sub.categoryId?.title || ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900">Add Sub-Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FiX className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Parent Category */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
                  Parent Category *
                </label>
                <select
                  required
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-[#cfdc01] transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.filter(c => c.categoryType === 'product').map(cat => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Name */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
                  Sub-Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Safety Shoes"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-[#cfdc01] transition-colors"
                />
              </div>

              {/* Icon Upload */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
                  Icon (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-sky-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <FiImage className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || uploadingIcon}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: brandColor }}
              >
                {isSubmitting ? 'Creating...' : 'Create Sub-Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default VendorSubCategoriesPage;
