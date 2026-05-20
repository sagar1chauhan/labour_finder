import React, { useEffect, useState, useMemo } from "react";
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CardShell from "../components/CardShell";
import Modal from "../components/Modal";
import { subCategoryService, categoryService } from "../../../../../services/catalogService";
import { toAssetUrl } from "../utils";

const SubCategoriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [form, setForm] = useState({
    title: "",
    iconUrl: "",
    categoryId: ""
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSubCategories = useMemo(() => {
    if (selectedCategoryFilter === "all") return subCategories;
    return subCategories.filter(s => String(s.categoryId?._id || s.categoryId) === String(selectedCategoryFilter));
  }, [subCategories, selectedCategoryFilter]);

  const refreshData = async () => {
    try {
      setFetching(true);
      const [subCatRes, catRes] = await Promise.all([
        subCategoryService.getAll(),
        categoryService.getAll()
      ]);

      if (subCatRes.success) setSubCategories(subCatRes.subCategories);
      if (catRes.success) setCategories(catRes.categories);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingIcon(true);
      const res = await subCategoryService.uploadImage(file, 'subcategories');
      if (res.success) {
        setForm({ ...form, iconUrl: res.imageUrl });
        toast.success("Icon uploaded");
      } else {
        toast.error(res.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload error");
    } finally {
      setUploadingIcon(false);
    }
  };

  const openModal = (subCat = null) => {
    if (subCat) {
      setEditingId(subCat._id);
      setForm({
        title: subCat.title,
        iconUrl: subCat.iconUrl || "",
        categoryId: subCat.categoryId?._id || subCat.categoryId || ""
      });
    } else {
      setEditingId(null);
      setForm({ title: "", iconUrl: "", categoryId: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.categoryId) {
      return toast.error("Please provide title and select a category");
    }

    try {
      setLoading(true);
      if (editingId) {
        const res = await subCategoryService.update(editingId, form);
        if (res.success) {
          toast.success("Sub-Category updated!");
          setIsModalOpen(false);
          refreshData();
        }
      } else {
        const res = await subCategoryService.create(form);
        if (res.success) {
          toast.success("Sub-Category created!");
          setIsModalOpen(false);
          refreshData();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sub-category?")) return;
    try {
      setLoading(true);
      const res = await subCategoryService.delete(id);
      if (res.success) {
        toast.success("Deleted successfully");
        refreshData();
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardShell title="Manage Sub Categories" icon={FiGrid}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-64">
          <label className="text-sm text-gray-600 mb-1 block font-medium">Filter by Category</label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => {
              const catId = cat.id || cat._id;
              return <option key={catId} value={catId}>{cat.title}</option>;
            })}
          </select>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-sm w-full sm:w-auto justify-center"
        >
          <FiPlus className="mr-2" /> Add Sub-Category
        </button>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubCategories.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <FiGrid className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-lg">No sub-categories found</p>
              <p className="text-gray-400 text-sm mt-1">Create a sub-category to get started</p>
            </div>
          ) : (
            filteredSubCategories.map((subCat) => (
              <div key={subCat._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col group">
                <div className="p-5 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100 overflow-hidden">
                      {subCat.iconUrl ? (
                        <img src={toAssetUrl(subCat.iconUrl)} alt={subCat.title} className="w-full h-full object-contain" />
                      ) : (
                        <FiImage className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => openModal(subCat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(subCat._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{subCat.title}</h3>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                    Parent: {subCat.categoryId?.title || "Unknown"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Sub-Category" : "Add Sub-Category"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => {
                const catId = cat.id || cat._id;
                return <option key={catId} value={catId}>{cat.title}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Safety Shoes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-2">
                {form.iconUrl ? (
                  <img src={toAssetUrl(form.iconUrl)} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <FiImage className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {uploadingIcon && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploadingIcon} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Sub-Category"}
            </button>
          </div>
        </form>
      </Modal>
    </CardShell>
  );
};

export default SubCategoriesPage;
