import React, { useState, useEffect } from 'react';
import { FiPlus, FiGrid, FiBox, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { vendorTheme } from '../../../../theme';
import Header from '../../components/layout/Header';
import { vendorCategoryService } from '../../services/vendorCategoryService';
import LogoLoader from '../../../../components/common/LogoLoader';
import { uploadToCloudinary } from '../../../../utils/cloudinaryUpload';
import { FiImage, FiX } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('service'); // 'service' or 'product'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryType: 'service'
  });

  useEffect(() => {
    if (isModalOpen) {
      setFormData(prev => ({ ...prev, categoryType: activeTab }));
    } else {
      // Reset images on close
      setImageFile(null);
      setImagePreview('');
    }
  }, [isModalOpen, activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await vendorCategoryService.getCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All associations with this category will be lost. Proceed?')) return;
    try {
      const res = await vendorCategoryService.deleteCategory(id);
      if (res.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Category title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl = null;
      if (imageFile) {
        toast.loading('Uploading icon...', { id: 'upload-cat' });
        imageUrl = await uploadToCloudinary(imageFile, 'categories');
        toast.dismiss('upload-cat');
      }

      const res = await vendorCategoryService.createCategory({ ...formData, imageUrl });
      if (res.success) {
        toast.success('Category created successfully');
        setIsModalOpen(false);
        setFormData({ title: '', description: '', categoryType: 'service' });
        setImageFile(null);
        setImagePreview('');
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Categories" />

      <main className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Categories</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#a2ad02] text-white rounded-xl font-semibold shadow-md active:scale-95 transition-transform hover:bg-[#889400]"
          >
            <FiPlus />
            <span>Add New</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <button
            onClick={() => setActiveTab('service')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'service' ? 'bg-[#a2ad02] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FiGrid className={activeTab === 'service' ? 'text-white' : 'text-[#a2ad02]'} />
            Services
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'product' ? 'bg-[#a2ad02] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FiBox className={activeTab === 'product' ? 'text-white' : 'text-[#a2ad02]'} />
            Products
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LogoLoader />
          </div>
        ) : categories.filter(c => c.categoryType === activeTab).length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
            {activeTab === 'service' ? <FiGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" /> : <FiBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />}
            <p className="text-gray-500 font-medium">No {activeTab} categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.filter(c => c.categoryType === activeTab).map((cat) => (
              <div 
                key={cat.id} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-[#a2ad02]/10 text-[#a2ad02]">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                  ) : (
                    cat.categoryType === 'product' ? <FiBox className="w-6 h-6" /> : <FiGrid className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{cat.title}</h3>
                    {cat.isOwnCategory && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#a2ad02]/10 text-green-800 rounded uppercase tracking-wider">
                          Yours
                        </span>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          title="Delete Category"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded uppercase tracking-wider bg-green-100 text-green-800">
                      {cat.categoryType}
                    </span>
                    {cat.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <FiCheckCircle /> Active
                      </span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Create New Category</h3>
              <p className="text-sm text-gray-500 mt-1">Add a custom category if it doesn't exist.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Electrical Materials"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a2ad02] focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryType: 'service' })}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${formData.categoryType === 'service' ? 'bg-[#a2ad02]/10 border-[#a2ad02] text-green-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiGrid className="w-6 h-6" />
                    <span className="text-sm font-bold">Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryType: 'product' })}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${formData.categoryType === 'product' ? 'bg-[#a2ad02]/10 border-[#a2ad02] text-green-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiBox className="w-6 h-6" />
                    <span className="text-sm font-bold">Product</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center uppercase tracking-widest text-[10px]">Category Icon</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center relative bg-gray-50 overflow-hidden group hover:border-[#a2ad02]/50 transition-all">
                  {imagePreview ? (
                    <div className="relative w-full h-32">
                       <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                       <button 
                        type="button" 
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md"
                       >
                         <FiX size={12} />
                       </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-2">
                        <FiImage className="h-5 w-5 text-[#a2ad02]" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Upload Icon</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-[#a2ad02] text-white font-bold rounded-xl hover:bg-[#889400] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
