import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronRight, FiX } from 'react-icons/fi';

const MANPOWER_DATA = [
  {
    title: "Engineer",
    icon: "👷‍♂️",
    subCategories: ["Architect", "Engineer", "Supervisor", "Home decor"]
  },
  {
    title: "Mason & Labour",
    icon: "🧱",
    subCategories: ["Tile fixer", "Plumber work", "Carpenter", "Electrician", "Painter", "Plaster & dismantler", "Bar Bander", "Shuttering"]
  },
  {
    title: "Contractor",
    icon: "🏗️",
    subCategories: ["Building contractor", "Renovation contractor", "Interior contractor"]
  },
  {
    title: "Vehicle Service",
    icon: "🚜",
    subCategories: ["JCB", "Tractor", "Tempo", "Eicher", "Crane", "Water Tanker"]
  },
  {
    title: "Rental Machine",
    icon: "⚙️",
    subCategories: ["Mixture", "Breaker", "Compressor"]
  }
];

const SHOP_DATA = {
  "Constructor material": {
    title: "Constructor material",
    icon: "🧱",
    subCategories: ["Hardware Tool Shop", "Plywood Traders", "Cement Dealers", "Electrical Shop"]
  },
  "Safety Materials": {
    title: "Safety Materials",
    icon: "🦺",
    subCategories: ["Safety Gear Shop", "Helmet Suppliers", "Safety Shoes Store"]
  }
};

const subCategoryImages = {
  "Building contractor": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
  "Renovation contractor": "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80",
  "Interior contractor": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80",
  "Hardware Tool Shop": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80",
  "Plywood Traders": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80",
  "Cement Dealers": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80",
  "Electrical Shop": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
  "Safety Gear Shop": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80",
  "Helmet Suppliers": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80",
  "Safety Shoes Store": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
  "Architect": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80",
  "Engineer": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
  "Supervisor": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80",
  "Home decor": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  "Tile fixer": "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=400&q=80",
  "Plumber work": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80",
  "Carpenter": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80",
  "Electrician": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
  "Painter": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80",
  "Plaster & dismantler": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80",
  "Bar Bander": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
  "Shuttering": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80",
  "JCB": "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=400&q=80",
  "Tractor": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80",
  "Tempo": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80",
  "Eicher": "https://images.unsplash.com/photo-1592838064575-70ed626d3a44?auto=format&fit=crop&w=400&q=80",
  "Crane": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
  "Water Tanker": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=400&q=80",
  "Mixture": "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80",
  "Breaker": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
  "Compressor": "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=400&q=80"
};

const SubCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryTitle = searchParams.get('category');
  const type = searchParams.get('type') || 'worker';

  const category = useMemo(() => {
    if (type === 'shop') {
      return SHOP_DATA[categoryTitle] || {
        title: categoryTitle || 'Shop',
        icon: '📦',
        subCategories: ["Hardware Tool Shop", "Plywood Traders", "Electrical Shop", "Plumbing Supplies"]
      };
    }
    return MANPOWER_DATA.find(c => c.title === categoryTitle) || {
      title: categoryTitle || 'Category',
      icon: '🔧',
      subCategories: []
    };
  }, [categoryTitle, type]);

  if (!category) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50 shadow-sm bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#f5faff] rounded-2xl flex items-center justify-center p-2 border border-sky-100/50 shadow-sm text-2xl">
            {category.icon}
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
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-all">
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
            {category.subCategories.map((sub, idx) => {
              const imgUrl = subCategoryImages[sub] || "https://img.freepik.com/free-photo/builder-with-helmet-tools_114579-2428.jpg?w=740";
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (type === 'shop') {
                      navigate(`/user/shops?category=${encodeURIComponent(sub)}`);
                    } else {
                      navigate(`/user/workers?category=${encodeURIComponent(sub)}`);
                    }
                  }}
                  className="bg-white rounded-2xl p-3 border border-gray-100 flex justify-between items-center group active:scale-[0.98] transition-all cursor-pointer hover:border-[#cfdc01] hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                      <img 
                        src={imgUrl} 
                        alt={sub} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?w=740";
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-black text-gray-900">{sub}</h3>
                  </div>
                  <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-[#cfdc01] group-hover:text-[#0f172a] transition-all shrink-0">
                    <FiChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategories;
