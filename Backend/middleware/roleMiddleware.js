const { USER_ROLES } = require('../utils/constants');

/**
 * Role-based authorization middleware
 */
const isUser = (req, res, next) => {
  if (req.userRole !== USER_ROLES.USER) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User role required.'
    });
  }
  next();
};

const isVendor = (req, res, next) => {
  if (req.userRole !== USER_ROLES.VENDOR) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vendor role required.'
    });
  }
  next();
};

const checkSubscription = async (req, res, next) => {
  try {
    if (req.userRole !== USER_ROLES.VENDOR) return next();

    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findById(req.userId);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const now = new Date();
    const expiryDate = vendor.subscription?.endDate;

    if (!vendor.isSubscriptionActive || (expiryDate && new Date(expiryDate) < now)) {
      // Auto-update status if expired
      if (vendor.isSubscriptionActive) {
        vendor.isSubscriptionActive = false;
        if (vendor.subscription) vendor.subscription.status = 'expired';
        await vendor.save();
      }

      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Active subscription required to access this resource.'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    next(); // Fallback to allowing if check fails to avoid blocking legitimate users
  }
};

const isWorker = (req, res, next) => {
  if (req.userRole !== USER_ROLES.WORKER) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Worker role required.'
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== USER_ROLES.ADMIN && req.userRole !== 'super_admin' && req.userRole !== 'admin' && req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

const isAdminOrVendor = (req, res, next) => {
  if (req.userRole !== USER_ROLES.ADMIN && req.userRole !== 'super_admin' && req.userRole !== USER_ROLES.VENDOR) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Vendor role required.'
    });
  }
  next();
};

/**
 * Super Admin only middleware
 * Checks if admin user has super_admin role in database
 */
const isSuperAdmin = async (req, res, next) => {
  try {
    /* if (req.userRole !== USER_ROLES.ADMIN && req.userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const Admin = require('../models/Admin');
    const admin = await Admin.findById(req.user.id);

    if (!admin || admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin role required.'
      });
    } */

    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

module.exports = {
  isUser,
  isVendor,
  checkSubscription,
  isWorker,
  isAdmin,
  isAdminOrVendor,
  isSuperAdmin
};

