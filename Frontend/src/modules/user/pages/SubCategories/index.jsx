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
    subCategories: ["Material", "Mixture", "Breaker", "Compressor"]
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
  "Building contractor": "https://img.freepik.com/free-photo/building-construction-site-with-scaffolding_1127-2856.jpg?w=740",
  "Renovation contractor": "https://img.freepik.com/free-photo/man-renovating-house_23-2148187834.jpg?w=740",
  "Interior contractor": "https://img.freepik.com/free-photo/modern-interior-design-with-home-decor_23-2148301549.jpg?w=740",
  "Hardware Tool Shop": "https://img.freepik.com/free-photo/view-hardware-store-with-tools-equipment_23-2151693766.jpg?w=740",
  "Plywood Traders": "https://img.freepik.com/free-photo/wooden-planks-stack-background_1398-4663.jpg?w=740",
  "Cement Dealers": "https://img.freepik.com/free-photo/sack-cement-plaster-building-site_1150-13768.jpg?w=740",
  "Electrical Shop": "https://img.freepik.com/free-photo/electric-tools-market_1398-3168.jpg?w=740",
  "Safety Gear Shop": "https://img.freepik.com/free-photo/construction-safety-equipment_1398-4179.jpg?w=740",
  "Helmet Suppliers": "https://img.freepik.com/free-photo/helmet-construction-site_1150-13768.jpg?w=740",
  "Safety Shoes Store": "https://img.freepik.com/free-photo/safety-shoes-construction-site_1150-13768.jpg?w=740",
  "Architect": "https://img.freepik.com/free-photo/young-female-architect-working-office_23-2147772348.jpg?w=740",
  "Engineer": "https://img.freepik.com/free-photo/male-engineer-working-office_23-2147772351.jpg?w=740",
  "Supervisor": "https://img.freepik.com/free-photo/construction-manager-with-hard-hat_114579-2428.jpg?w=740",
  "Home decor": "https://img.freepik.com/free-photo/interior-design-concept-with-furniture_23-2148301545.jpg?w=740",
  "Tile fixer": "https://img.freepik.com/free-photo/worker-laying-tiles-floor_23-2148404285.jpg?w=740",
  "Plumber work": "https://img.freepik.com/free-photo/plumber-ready-work_23-2147744158.jpg?w=740",
  "Carpenter": "https://img.freepik.com/free-photo/carpenter-working-wood_23-2147772344.jpg?w=740",
  "Electrician": "https://img.freepik.com/free-photo/smiling-electrician-fixing-electrical-panel_23-2147772322.jpg?w=740",
  "Painter": "https://img.freepik.com/free-photo/painter-painting-wall_23-2148187835.jpg?w=740",
  "Plaster & dismantler": "https://img.freepik.com/free-photo/plasterer-working-wall_23-2148187836.jpg?w=740",
  "Bar Bander": "https://img.freepik.com/free-photo/steel-fixer-working-construction-site_23-2148187837.jpg?w=740",
  "Shuttering": "https://img.freepik.com/free-photo/construction-worker-working-scaffolding_23-2148187838.jpg?w=740",
  "JCB": "https://img.freepik.com/free-photo/excavator-working-construction-site_23-2148187839.jpg?w=740",
  "Tractor": "https://img.freepik.com/free-photo/tractor-working-field_23-2148187840.jpg?w=740",
  "Tempo": "https://img.freepik.com/free-photo/truck-driving-road_23-2148187841.jpg?w=740",
  "Eicher": "https://img.freepik.com/free-photo/truck-driving-road_23-2148187841.jpg?w=740",
  "Crane": "https://img.freepik.com/free-photo/crane-working-construction-site_23-2148187842.jpg?w=740",
  "Water Tanker": "https://img.freepik.com/free-photo/water-tanker-truck_23-2148187843.jpg?w=740",
  "Material": "https://img.freepik.com/free-photo/construction-materials_23-2148187844.jpg?w=740",
  "Mixture": "https://img.freepik.com/free-photo/concrete-mixer-machine_23-2148187845.jpg?w=740",
  "Breaker": "https://img.freepik.com/free-photo/jackhammer-working-construction-site_23-2148187846.jpg?w=740",
  "Compressor": "https://img.freepik.com/free-photo/air-compressor-working-construction-site_23-2148187847.jpg?w=740"
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
