const Category = require('../../models/Category');
const Brand = require('../../models/Brand');
const Service = require('../../models/UserService');
const HomeContent = require('../../models/HomeContent');
const { calculateDistance } = require('../../services/locationService');
const Vendor = require('../../models/Vendor');
const City = require('../../models/City');

/**
 * Helper to get vendor match query for catalog filtering
 */
const getVendorMatchQuery = async (cityId) => {
  const match = { 
    isOnline: true, 
    availability: 'AVAILABLE',
    approvalStatus: 'approved'
  };

  if (cityId) {
    const city = await City.findById(cityId);
    if (city) {
      match['address.city'] = { $regex: new RegExp(`^${city.name.trim()}$`, 'i') };
    }
  }
  return match;
};

/**
 * Public Catalog Controllers
 * These endpoints are accessible without authentication for user app
 */

/**
 * Get all active categories for user app
 * GET /api/public/categories
 */
const getPublicCategories = async (req, res) => {
  try {
    const { cityId } = req.query;

    // Build query
    const query = { status: 'active' };
    if (cityId) {
      query.$or = [
        { cityIds: cityId },
        { cityIds: { $exists: false } },
        { cityIds: { $size: 0 } }
      ];
    }

    const categories = await Category.find(query)
      .select('title slug homeIconUrl homeBadge hasSaleBadge homeOrder showOnHome categoryType')
      .sort({ homeOrder: 1, createdAt: -1 })
      .lean();

    // Map categories
    const initialCategories = categories.map(cat => ({
      id: cat._id.toString(),
      title: cat.title,
      slug: cat.slug,
      icon: cat.homeIconUrl || '',
      badge: cat.homeBadge || '',
      hasSaleBadge: cat.hasSaleBadge || false,
      showOnHome: cat.showOnHome || false,
      categoryType: cat.categoryType || 'service'
    }));

    // Deduplicate by title to prevent duplicate categories on the UI
    const uniqueCategories = [];
    const seenTitles = new Set();
    initialCategories.forEach(cat => {
      const lowerTitle = cat.title.toLowerCase().trim();
      if (!seenTitles.has(lowerTitle)) {
        seenTitles.add(lowerTitle);
        uniqueCategories.push(cat);
      }
    });

    res.status(200).json({
      success: true,
      categories: uniqueCategories
    });
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories. Please try again.'
    });
  }
};

const getPublicBrands = async (req, res) => {
  try {
    const { categoryId, categorySlug, search, cityId, lat, lng, all } = req.query;

    // Build query
    const query = { status: 'active' };
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (category) {
        // Find all categories with the same title to show all vendors' brands for this category
        const relatedCategories = await Category.find({ 
          title: { $regex: `^${category.title.trim()}$`, $options: 'i' }, 
          status: 'active' 
        }).select('_id');
        const catIds = relatedCategories.map(c => c._id);
        query.categoryIds = { $in: catIds };
      } else {
        query.categoryIds = categoryId;
      }
    }
    if (cityId) {
      query.$or = [
        { cityIds: cityId },
        { cityIds: { $exists: false } },
        { cityIds: { $size: 0 } }
      ];
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedSearch, $options: 'i' };
    }

    let brands;
    if (all === 'true') {
      brands = await Brand.find(query)
        .select('title slug iconUrl logo imageUrl badge categoryIds basePrice discountPrice sections type vendorId isPriceDisclosed')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      const vendorMatch = await getVendorMatchQuery(cityId);

      // Fetch all brands matching the query first (to keep their original vendorId values)
      const rawBrands = await Brand.find(query)
        .select('title slug iconUrl logo imageUrl badge categoryIds basePrice discountPrice sections type vendorId isPriceDisclosed')
        .sort({ createdAt: -1 })
        .lean();

      // Separate them into Admin brands (no vendorId) and Vendor brands
      const adminBrands = rawBrands.filter(b => !b.vendorId);
      const vendorBrandIds = rawBrands.filter(b => b.vendorId).map(b => b._id);

      // Populate only the vendor-specific brands using the vendorMatch criteria
      let activeVendorBrands = [];
      if (vendorBrandIds.length > 0) {
        activeVendorBrands = await Brand.find({ _id: { $in: vendorBrandIds } })
          .select('title slug iconUrl logo imageUrl badge categoryIds basePrice discountPrice sections type vendorId isPriceDisclosed')
          .populate({
            path: 'vendorId',
            match: vendorMatch,
            select: 'name businessName policeVerification address rating totalJobs profilePhoto isOnline availability geoLocation location'
          })
          .sort({ createdAt: -1 })
          .lean();
        
        // Filter out those where vendor populated reference is null (meaning vendor is offline/not found/unavailable)
        activeVendorBrands = activeVendorBrands.filter(b => b.vendorId);
      }

      // Combine Admin brands (always shown) and active Vendor brands
      brands = [...adminBrands, ...activeVendorBrands];
    }

    // Deduplicate by title to ensure a clean catalog
    const groupedBrands = new Map();
    const userLoc = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
    
    brands.forEach(brand => {
      const vendor = brand.vendorId;
      // STRICT CHECK: For vendor-specific brands, only show if online and available. Admin brands (no vendor) are always shown.
      if (brand.vendorId && (!vendor || vendor.isOnline === false || vendor.availability !== 'AVAILABLE')) return;
      
      if (userLoc && vendor) {
        const vLat = vendor.location?.lat || vendor.address?.lat || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[1] : null);
        const vLng = vendor.location?.lng || vendor.address?.lng || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[0] : null);
        if (vLat && vLng) {
          brand.distance = calculateDistance(userLoc, { lat: vLat, lng: vLng });
        } else {
          brand.distance = Infinity;
        }
      } else {
        brand.distance = 0;
      }

      const titleKey = brand.title.toLowerCase().trim();
      const existing = groupedBrands.get(titleKey);
      
      // LOGIC: 
      // 1. If brand doesn't exist in map yet, add it.
      // 2. If it exists and we have location, pick the NEAREST.
      // 3. If distances are equal (or no location), pick the CHEAPEST (basePrice).
      if (!existing) {
        groupedBrands.set(titleKey, brand);
      } else {
        const currentPrice = brand.basePrice || 0;
        const existingPrice = existing.basePrice || 0;
        
        if (userLoc) {
          if (brand.distance < existing.distance) {
            groupedBrands.set(titleKey, brand);
          } else if (brand.distance === existing.distance && currentPrice < existingPrice) {
            groupedBrands.set(titleKey, brand);
          }
        } else if (currentPrice < existingPrice) {
          groupedBrands.set(titleKey, brand);
        }
      }
    });

    brands = Array.from(groupedBrands.values());

    // If categorySlug is provided, filter by category
    if (categorySlug) {
      const catQuery = { slug: categorySlug, status: 'active' };
      if (cityId) {
        catQuery.cityIds = cityId;
      }

      let category = await Category.findOne(catQuery).lean();

      if (!category && cityId) {
        category = await Category.findOne({ slug: categorySlug, status: 'active' }).lean();
      }

      if (category) {
        const relatedCategories = await Category.find({ 
          title: { $regex: `^${category.title.trim()}$`, $options: 'i' }, 
          status: 'active' 
        }).select('_id');
        const catIds = relatedCategories.map(c => c._id.toString());
        
        brands = brands.filter(b =>
          Array.isArray(b.categoryIds) &&
          b.categoryIds.some(id => catIds.includes(id.toString()))
        );
      }
    }

    res.status(200).json({
      success: true,
      brands: brands.map(brand => ({
        id: brand._id.toString(),
        title: brand.title,
        slug: brand.slug,
        icon: brand.iconUrl || '',
        logo: brand.logo || brand.iconUrl || '',
        imageUrl: brand.imageUrl || brand.iconUrl || '',
        badge: brand.badge || '',
        price: brand.basePrice || 0, // Legacy support
        originalPrice: brand.discountPrice ? (brand.basePrice + brand.discountPrice) : (brand.basePrice || 0),
        categoryId: brand.categoryIds && brand.categoryIds.length > 0 ? brand.categoryIds[0].toString() : null,
        categoryIds: (brand.categoryIds || []).map(id => id.toString()),
        sections: brand.sections || [],
        type: brand.type || 'service',
        isPriceDisclosed: brand.isPriceDisclosed ?? true,
        vendor: brand.vendorId ? {
          id: brand.vendorId._id,
          name: brand.vendorId.name,
          businessName: brand.vendorId.businessName,
          policeVerification: brand.vendorId.policeVerification,
          address: brand.vendorId.address,
          rating: brand.vendorId.rating,
          totalJobs: brand.vendorId.totalJobs,
          profilePhoto: brand.vendorId.profilePhoto,
          isOnline: brand.vendorId.isOnline,
          availability: brand.vendorId.availability
        } : null
      }))
    });
  } catch (error) {
    console.error('Get public brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands. Please try again.'
    });
  }
};

/**
 * Get brand by slug for user app
 * GET /api/public/brands/slug/:slug
 */
const getPublicBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { cityId } = req.query;
    const vendorMatch = await getVendorMatchQuery(cityId);

    const brand = await Brand.findOne({ slug, status: 'active' })
      .populate('categoryIds', 'title slug')
      .populate('vendorId', 'name businessName isOnline availability address')
      .lean();

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Remove _id from nested objects
    const cleanBrand = JSON.parse(JSON.stringify(brand));
    const removeIds = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => {
          if (item && typeof item === 'object') {
            const { _id, ...rest } = item;
            return removeIds(rest);
          }
          return item;
        });
      } else if (obj && typeof obj === 'object') {
        const { _id, ...rest } = obj;
        return Object.keys(rest).reduce((acc, key) => {
          acc[key] = removeIds(rest[key]);
          return acc;
        }, {});
      }
      return obj;
    };

    // Find all brands with the same title to ensure we show the closest one's details
    const relatedBrands = await Brand.find({
      title: { $regex: `^${brand.title.trim()}$`, $options: 'i' },
      status: 'active'
    }).populate('vendorId', 'name businessName isOnline availability location address geoLocation').lean();

    // Determine the closest brand/vendor if location is provided
    const { lat, lng } = req.query;
    const userLoc = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
    
    let closestBrand = brand;
    if (userLoc) {
      let minDistance = Infinity;
      relatedBrands.forEach(rb => {
        const vendor = rb.vendorId;
        if (vendor) {
          const vLat = vendor.location?.lat || vendor.address?.lat || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[1] : null);
          const vLng = vendor.location?.lng || vendor.address?.lng || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[0] : null);
          if (vLat && vLng) {
            const dist = calculateDistance(userLoc, { lat: vLat, lng: vLng });
            if (dist < minDistance) {
              minDistance = dist;
              closestBrand = rb;
            }
          }
        }
      });
    }

    // Fetch ALL services in the same category that have the same title as any service in this brand
    // This is more robust than just looking at brand IDs
    const initialServices = await Service.find({ brandId: brand._id, status: 'active' }).select('title categoryId');
    const serviceTitles = [...new Set(initialServices.map(s => s.title.toLowerCase().trim()))];
    
    // Fallback to brand title if no services found yet
    if (serviceTitles.length === 0) {
      serviceTitles.push(brand.title.toLowerCase().trim());
    }

    const allServices = await Service.find({
      title: { $in: serviceTitles.map(t => new RegExp(`${t}`, 'i')) },
      status: 'active'
    })
      .populate({
        path: 'vendorId',
        match: vendorMatch,
        select: 'name businessName isOnline availability location address geoLocation'
      })
      .lean();

    // Deduplicate services by title, picking the one from the closest/best vendor
    const groupedServices = new Map();
    allServices.forEach(svc => {
      const vendor = svc.vendorId;
      // STRICT CHECK: Only show Available vendors
      if (!vendor || vendor.isOnline === false || vendor.availability !== 'AVAILABLE') return;

      if (userLoc) {
        const vLat = vendor.location?.lat || vendor.address?.lat || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[1] : null);
        const vLng = vendor.location?.lng || vendor.address?.lng || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[0] : null);
        if (vLat && vLng) {
          svc.distance = calculateDistance(userLoc, { lat: vLat, lng: vLng });
        } else {
          svc.distance = Infinity;
        }
      } else {
        svc.distance = 0;
      }

      const titleKey = svc.title.toLowerCase().trim();
      const existing = groupedServices.get(titleKey);
      // LOGIC: 
      // 1. If service doesn't exist, add it.
      // 2. If it exists and we have location, pick the NEAREST.
      // 3. If distances are equal (or no location), pick the CHEAPEST.
      if (!existing) {
        groupedServices.set(titleKey, svc);
      } else {
        const currentPrice = svc.basePrice || 0;
        const existingPrice = existing.basePrice || 0;

        if (userLoc) {
          if (svc.distance < existing.distance) {
            groupedServices.set(titleKey, svc);
          } else if (svc.distance === existing.distance && currentPrice < existingPrice) {
            groupedServices.set(titleKey, svc);
          }
        } else if (currentPrice < existingPrice) {
          groupedServices.set(titleKey, svc);
        }
      }
    });

    const brandServices = Array.from(groupedServices.values());

    // Map services to a default section structure for the frontend
    const servicesSection = {
      title: closestBrand.title,
      subtitle: 'Available Services',
      cards: brandServices.map(svc => ({
        id: svc._id.toString(),
        serviceId: svc._id.toString(), // CRITICAL for 'Add' button
        categoryId: svc.categoryId?.toString() || brand.categoryId?.toString() || null, // CRITICAL for 'Add' button
        title: svc.title,
        subtitle: svc.description || '',
        price: svc.basePrice,
        vendorName: svc.vendorId?.businessName || svc.vendorId?.name,
        vendorId: svc.vendorId?._id?.toString(),
        rating: "4.8", 
        reviews: "1k+",
        image: svc.iconUrl || closestBrand.iconUrl || '', // Changed to 'image' for ServiceWithRatingCard
        features: svc.description ? [svc.description] : [],
        duration: "60 min",
        type: svc.type || 'service',
        isPriceDisclosed: svc.isPriceDisclosed ?? true
      }))
    };

    const formattedBrand = {
      id: brand._id.toString(),
      title: brand.title,
      slug: brand.slug,
      icon: brand.iconUrl || '',
      logo: brand.logo || '',
      badge: brand.badge || '',
      basePrice: brand.basePrice, // Legacy
      category: brand.categoryIds && brand.categoryIds[0] ? {
        id: brand.categoryIds[0]._id.toString(),
        title: brand.categoryIds[0].title,
        slug: brand.categoryIds[0].slug
      } : null,
      categories: (brand.categoryIds || []).map(cat => ({
        id: cat._id.toString(),
        title: cat.title,
        slug: cat.slug
      })),
      page: brand.page ? removeIds(brand.page) : {
        banners: brand.iconUrl ? [{ imageUrl: brand.iconUrl, text: brand.title }] : [],
        paymentOffers: [],
        paymentOffersEnabled: false
      },
      sections: brandServices.length > 0 ? [servicesSection] : [],
      type: brand.type || 'service',
      isPriceDisclosed: brand.isPriceDisclosed ?? true,
      vendor: brand.vendorId ? {
        id: brand.vendorId._id,
        name: brand.vendorId.name,
        businessName: brand.vendorId.businessName,
        isOnline: brand.vendorId.isOnline,
        availability: brand.vendorId.availability
      } : null
    };

    res.status(200).json({
      success: true,
      brand: formattedBrand
    });
  } catch (error) {
    console.error('Get public brand by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand. Please try again.'
    });
  }
};

const getPublicServices = async (req, res) => {
  try {
    const { brandId, brandSlug, categoryId, lat, lng, cityId } = req.query;
    const vendorMatch = await getVendorMatchQuery(cityId);

    const query = { status: 'active' };

    if (brandId || brandSlug) {
      const brand = brandId ? await Brand.findById(brandId) : await Brand.findOne({ slug: brandSlug });
      if (brand) {
        // Search by title globally to allow ALL available vendors to show up
        const escapedTitle = brand.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.title = { $regex: escapedTitle, $options: 'i' };
      }
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedSearch, $options: 'i' };
    }

    const services = await Service.find(query)
      .populate({
        path: 'vendorId',
        match: vendorMatch, // Only populate if online and in city
        select: 'name businessName policeVerification address rating totalJobs profilePhoto isOnline availability geoLocation location'
      })
      .sort({ createdAt: 1 })
      .lean();

    // Filter out services where vendor is offline or not found (due to match condition above)
    let activeServices = services.filter(svc => svc.vendorId);

    // Deduplicate by title to ensure only one "Reti" shows up even if 10 vendors have it
    const groupedServices = new Map();
    const userLoc = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

    activeServices.forEach(svc => {
      const vendor = svc.vendorId;
      // STRICT CHECK: Only show Available vendors
      if (!vendor || vendor.isOnline === false || vendor.availability !== 'AVAILABLE') return;
      
      // Calculate distance if coordinates available
      if (userLoc) {
        const vLat = vendor.location?.lat || vendor.address?.lat || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[1] : null);
        const vLng = vendor.location?.lng || vendor.address?.lng || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[0] : null);
        if (vLat && vLng) {
          svc.distance = calculateDistance(userLoc, { lat: vLat, lng: vLng });
        } else {
          svc.distance = Infinity;
        }
      } else {
        svc.distance = 0; // No distance sorting if no user location
      }

      const titleKey = svc.title.toLowerCase().trim();
      const existing = groupedServices.get(titleKey);

      // If no user location, just keep the first one. 
      // If user location exists, keep the closest one.
      // LOGIC: 
      // 1. If service doesn't exist, add it.
      // 2. If it exists and we have location, pick the NEAREST.
      // 3. If distances are equal (or no location), pick the CHEAPEST.
      if (!existing) {
        groupedServices.set(titleKey, svc);
      } else {
        const currentPrice = svc.basePrice || 0;
        const existingPrice = existing.basePrice || 0;

        if (userLoc) {
          if (svc.distance < existing.distance) {
            groupedServices.set(titleKey, svc);
          } else if (svc.distance === existing.distance && currentPrice < existingPrice) {
            groupedServices.set(titleKey, svc);
          }
        } else if (currentPrice < existingPrice) {
          groupedServices.set(titleKey, svc);
        }
      }
    });

    activeServices = Array.from(groupedServices.values());

    res.status(200).json({
      success: true,
      services: activeServices.map(svc => ({
        id: svc._id.toString(),
        title: svc.title,
        slug: svc.slug,
        icon: svc.iconUrl,
        basePrice: svc.basePrice,
        discountPrice: svc.discountPrice || 0,
        gstPercentage: svc.gstPercentage,
        description: svc.description,
        brandId: svc.brandId?._id,
        brandName: svc.brandId?.title,
        brandIcon: svc.brandId?.iconUrl,
        type: svc.type || 'service',
        isPriceDisclosed: svc.isPriceDisclosed ?? true,
        vendor: {
          id: svc.vendorId._id,
          name: svc.vendorId.name,
          businessName: svc.vendorId.businessName,
          policeVerification: svc.vendorId.policeVerification,
          address: svc.vendorId.address,
          rating: svc.vendorId.rating,
          totalJobs: svc.vendorId.totalJobs,
          profilePhoto: svc.vendorId.profilePhoto,
          isOnline: svc.vendorId.isOnline,
          availability: svc.vendorId.availability
        }
      }))
    });
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

/**
 * Get home content
 */
const getPublicHomeContent = async (req, res) => {
  try {
    const { cityId } = req.query;

    // Fetch active categories
    const categoriesRes = await Category.find({ 
      status: 'active', 
      $or: cityId ? [
        { cityIds: cityId },
        { cityIds: { $exists: false } },
        { cityIds: { $size: 0 } }
      ] : [{ status: 'active' }]
    })
      .select('title slug homeIconUrl homeBadge hasSaleBadge categoryType')
      .sort({ homeOrder: 1 })
      .lean();

    const formattedCategories = categoriesRes.map(cat => ({
      id: cat._id.toString(),
      title: cat.title,
      slug: cat.slug,
      icon: cat.homeIconUrl || '',
      badge: cat.homeBadge || '',
      hasSaleBadge: cat.hasSaleBadge || false,
      categoryType: cat.categoryType || 'service'
    }));

    // Deduplicate by title to prevent duplicate categories on the UI
    const uniqueCategories = [];
    const seenTitles = new Set();
    formattedCategories.forEach(cat => {
      const lowerTitle = cat.title.toLowerCase().trim();
      if (!seenTitles.has(lowerTitle)) {
        seenTitles.add(lowerTitle);
        uniqueCategories.push(cat);
      }
    });

    const homeContent = await HomeContent.getHomeContent(cityId);

    if (!homeContent) {
      return res.status(200).json({
        success: true,
        categories: uniqueCategories,
        homeContent: {
          banners: [],
          promos: [],
          curated: [],
          noteworthy: [],
          booked: [],
          categorySections: []
        }
      });
    }

    // Used for backwards compatibility, we might need to update this to refer to Brands?
    // For now keeping as is, but assuming targetServiceId will point to Brand ID essentially.

    const contentObj = homeContent.toObject();

    const formattedContent = {
      banners: (contentObj.banners || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      promos: (contentObj.promos || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      curated: (contentObj.curated || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      noteworthy: (contentObj.noteworthy || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      booked: (contentObj.booked || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      categorySections: (contentObj.categorySections || []).map(section => ({
        ...section,
        id: section._id ? section._id.toString() : section.id,
        seeAllTargetCategoryId: section.seeAllTargetCategoryId?.toString() || null,
        seeAllTargetServiceId: section.seeAllTargetServiceId?.toString() || null,
        cards: (section.cards || []).map(card => ({
          ...card,
          id: card._id ? card._id.toString() : card.id,
          targetCategoryId: card.targetCategoryId?.toString() || null,
          targetServiceId: card.targetServiceId?.toString() || null,
        }))
      })),
      isBannersVisible: contentObj.isBannersVisible ?? true,
      isPromosVisible: contentObj.isPromosVisible ?? true,
      isCuratedVisible: contentObj.isCuratedVisible ?? true,
      isNoteworthyVisible: contentObj.isNoteworthyVisible ?? true,
      isBookedVisible: contentObj.isBookedVisible ?? true,
      isCategorySectionsVisible: contentObj.isCategorySectionsVisible ?? true,
      isCategoriesVisible: contentObj.isCategoriesVisible ?? true
    };

    res.status(200).json({
      success: true,
      categories: uniqueCategories,
      homeContent: formattedContent
    });

  } catch (error) {
    console.error('Get public home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home content. Please try again.'
    });
  }
};

/**
 * Get consolidated home data (Categories + Content)
 */
const getPublicHomeData = async (req, res) => {
  try {
    const { cityId } = req.query;

    // 1. Find all online and available vendors in the selected city
    const vendorQuery = await getVendorMatchQuery(cityId);
    const onlineVendors = await Vendor.find(vendorQuery).select('_id');
    const onlineVendorIds = onlineVendors.map(v => v._id);

    // 2. Find active categories and home content
    const [categoriesRes, homeContent] = await Promise.all([
      Category.find({ 
        status: 'active', 
        $or: cityId ? [
          { cityIds: cityId },
          { cityIds: { $exists: false } },
          { cityIds: { $size: 0 } }
        ] : [{ status: 'active' }]
      })
        .select('title slug homeIconUrl homeBadge hasSaleBadge categoryType')
        .sort({ homeOrder: 1 })
        .lean(),
      HomeContent.getHomeContent(cityId)
    ]);

    const formattedCategories = categoriesRes.map(cat => ({
      id: cat._id.toString(),
      title: cat.title,
      slug: cat.slug,
      icon: cat.homeIconUrl || '',
      badge: cat.homeBadge || '',
      hasSaleBadge: cat.hasSaleBadge || false,
      categoryType: cat.categoryType || 'service'
    }));

    // Deduplicate by title to prevent duplicate icons on home page
    const uniqueCategories = [];
    const seenTitles = new Set();
    formattedCategories.forEach(cat => {
      const lowerTitle = cat.title.toLowerCase();
      if (!seenTitles.has(lowerTitle)) {
        seenTitles.add(lowerTitle);
        uniqueCategories.push(cat);
      }
    });

    const { lat, lng } = req.query;
    const userLoc = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

    let formattedContent = null;
    if (homeContent) {
      const contentObj = homeContent.toObject();
      
      // We need to fetch all active services and brands to dynamically update home page cards
      // This ensures the price shown on home matches the nearest vendor
      const allActiveServices = await Service.find({ status: 'active' })
        .populate({
          path: 'vendorId',
          select: 'name businessName isOnline availability location address geoLocation',
          match: vendorQuery // Uses the city-filtered query from above
        })
        .lean();
      
      const allActiveBrands = await Brand.find({ status: 'active' })
        .populate({
          path: 'vendorId',
          select: 'name businessName isOnline availability location address geoLocation',
          match: vendorQuery // Uses the city-filtered query from above
        })
        .lean();

      // Helper to find best item for a title
      const findBestItem = (title, items) => {
        if (!title) return null;
        const targetTitle = title.toLowerCase().trim();
        
        let best = null;
        items.forEach(item => {
          const vendor = item.vendorId;
          // STRICT CHECK: Vendor must be Online AND Available
          if (!vendor || vendor.isOnline === false || vendor.availability !== 'AVAILABLE') return;
          
          if (item.title.toLowerCase().trim().includes(targetTitle) || targetTitle.includes(item.title.toLowerCase().trim())) {
            // Calculate distance
            if (userLoc) {
              const vLat = vendor.location?.lat || vendor.address?.lat || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[1] : null);
              const vLng = vendor.location?.lng || vendor.address?.lng || (vendor.geoLocation?.coordinates ? vendor.geoLocation.coordinates[0] : null);
              item.distance = (vLat && vLng) ? calculateDistance(userLoc, { lat: vLat, lng: vLng }) : Infinity;
            } else {
              item.distance = 0;
            }

            if (!best) {
              best = item;
            } else {
              const currentPrice = item.basePrice || 0;
              const bestPrice = best.basePrice || 0;
              
              if (userLoc) {
                if (item.distance < best.distance) {
                  best = item;
                } else if (item.distance === best.distance && currentPrice < bestPrice) {
                  best = item;
                }
              } else if (currentPrice < bestPrice) {
                best = item;
              }
            }
          }
        });
        return best;
      };

      formattedContent = {
        banners: (contentObj.banners || []).map(item => ({
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          slug: item.slug,
          order: item.order
        })),
        promos: (contentObj.promos || []).map(item => ({
          title: item.title,
          subtitle: item.subtitle,
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          order: item.order
        })),
        curated: (contentObj.curated || []).map(item => ({
          title: item.title,
          gifUrl: item.gifUrl,
          order: item.order
        })),
        noteworthy: (contentObj.noteworthy || []).map(item => ({
          title: item.title,
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          order: item.order
        })),
        booked: (contentObj.booked || []).map(item => {
          // Dynamically update booked items price
          const bestService = findBestItem(item.title, allActiveServices);
          return {
            title: item.title,
            rating: item.rating,
            price: bestService ? bestService.basePrice : item.price,
            imageUrl: item.imageUrl,
            targetCategoryId: item.targetCategoryId?.toString() || null,
            targetServiceId: bestService ? bestService._id.toString() : (item.targetServiceId?.toString() || null),
            slug: bestService ? bestService.slug : (item.slug || ''),
            order: item.order
          };
        }),
        categorySections: (contentObj.categorySections || []).map(section => ({
          title: section.title,
          seeAllTargetCategoryId: section.seeAllTargetCategoryId?.toString() || null,
          cards: (section.cards || []).map(card => {
            // Dynamically update card price and vendor name based on nearest logic
            const bestService = findBestItem(card.title, allActiveServices);
            const bestBrand = findBestItem(card.title, allActiveBrands);
            const best = bestService || bestBrand;
            
            let displayTitle = card.title;
            if (best && best.vendorId) {
              const vendorName = best.vendorId.businessName || best.vendorId.name;
              displayTitle = `${card.title} by ${vendorName}`;
            }

            return {
              title: displayTitle,
              imageUrl: card.imageUrl,
              price: best ? (best.basePrice || best.price) : card.price,
              rating: card.rating,
              targetCategoryId: card.targetCategoryId?.toString() || null,
              targetServiceId: card.targetServiceId?.toString() || null,
              slug: card.slug, // VITAL: Keep the original brand slug so navigation doesn't break
            };
          }),
          order: section.order
        })),
        isBannersVisible: contentObj.isBannersVisible ?? true,
        isPromosVisible: contentObj.isPromosVisible ?? true,
        isCuratedVisible: contentObj.isCuratedVisible ?? true,
        isNoteworthyVisible: contentObj.isNoteworthyVisible ?? true,
        isBookedVisible: contentObj.isBookedVisible ?? true,
        isCategorySectionsVisible: contentObj.isCategorySectionsVisible ?? true,
        isCategoriesVisible: contentObj.isCategoriesVisible ?? true
      };
    }

    res.status(200).json({
      success: true,
      categories: uniqueCategories,
      homeContent: formattedContent
    });
  } catch (error) {
    console.error('Get public home data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home data'
    });
  }
};

module.exports = {
  getPublicCategories,
  getPublicBrands,
  getPublicBrandBySlug,
  getPublicServices,
  getPublicHomeContent,
  getPublicHomeData
};
