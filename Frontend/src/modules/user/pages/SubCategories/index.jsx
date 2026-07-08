import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronRight, FiX } from 'react-icons/fi';
import publicDataService from '../../../../services/publicDataService';
import { publicCatalogService } from '../../../../services/catalogService';
import LogoLoader from '../../../../components/common/LogoLoader';

const SubCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryTitle = searchParams.get('category');
  const type = searchParams.get('type') || 'worker';

  const [category, setCategory] = useState(null);

  const handleClose = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/user/categories');
    }
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        if (type === 'worker') {
          // Fetch manpower categories and find matching one
          const res = await publicDataService.getManpowerCategories();
          if (res.success && res.categories) {
            const matched = res.categories.find(
              c => c.title.toLowerCase().trim() === categoryTitle?.toLowerCase().trim()
            );
            if (matched) {
              setCategory({
                title: matched.title,
                icon: matched.icon || '🔧',
                iconUrl: matched.iconUrl,
                subCategories: (matched.subCategories || []).map(sub => ({
                  id: sub._id || sub.id,
                  title: sub.title,
                  imageUrl: sub.iconUrl || sub.imageUrl || "https://img.freepik.com/free-photo/builder-with-helmet-tools_114579-2428.jpg?w=740"
                }))
              });
            }
          }
        } else {
          // Fetch product categories and find matching one
          const res = await publicCatalogService.getCategories();
          if (res?.success && res.categories) {
            const matched = res.categories.find(
              c => c.title.toLowerCase().trim() === categoryTitle?.toLowerCase().trim()
            );
            if (matched) {
              // Fetch brands under this product category
              const brandRes = await publicCatalogService.getBrands({ categoryId: matched.id });
              if (brandRes?.success && brandRes.brands) {
                setCategory({
                  title: matched.title,
                  icon: matched.icon || '📦',
                  iconUrl: matched.icon,
                  subCategories: brandRes.brands.map(b => ({
                    id: b.id || b._id,
                    title: b.title,
                    imageUrl: b.iconUrl || b.logo || "https://img.freepik.com/free-photo/builder-with-helmet-tools_114579-2428.jpg?w=740"
                  }))
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load subcategories:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryTitle) {
      fetchSubCategories();
    }
  }, [categoryTitle, type]);

  if (loading) return <LogoLoader />;
  if (!category) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-sm font-bold text-gray-500 mb-4">Category not found</p>
        <button onClick={handleClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50 shadow-sm bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#f5faff] rounded-2xl flex items-center justify-center p-2 border border-sky-100/50 shadow-sm text-2xl overflow-hidden shrink-0">
            {category.iconUrl ? (
              <img src={category.iconUrl} alt={category.title} className="w-full h-full object-contain" />
            ) : (
              category.icon
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {category.title}
            </h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Select Sub Category
            </p>
          </div>
        </div>
        <button onClick={handleClose} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-all shrink-0">
          <FiX className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar pb-24">
        {category.subCategories.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <p className="text-xs font-black uppercase">No sub-categories found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {category.subCategories.map((sub, idx) => (
              <div 
                key={sub.id || idx} 
                onClick={() => {
                  if (type === 'shop') {
                    navigate(`/user/catalog/brand/${sub.id}`);
                  } else {
                    navigate(`/user/workers?category=${encodeURIComponent(sub.title)}`);
                  }
                }}
                className="bg-white rounded-2xl p-3 border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-all cursor-pointer hover:border-[#cfdc01] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 p-1.5">
                    <img 
                      src={sub.imageUrl} 
                      alt={sub.title} 
                      className="w-full h-full object-contain" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?w=740";
                      }}
                    />
                  </div>
                  <h3 className="text-sm font-black text-gray-900">{sub.title}</h3>
                </div>
                <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-[#cfdc01] group-hover:text-[#0f172a] transition-all shrink-0">
                  <FiChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategories;
