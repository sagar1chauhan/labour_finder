const Booking = require('../../models/Booking');
const Settlement = require('../../models/Settlement');
const Vendor = require('../../models/Vendor');
const User = require('../../models/User');
const Settings = require('../../models/Settings');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../../utils/constants');

/**
 * Get Financial Dashboard Overview
 * Quick stats for the top cards
 */
const getFinanceOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // 1. Total Revenue (Completed & Paid Bookings)
    // We strictly use COMPLETED status.
    const revenueDocs = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: BOOKING_STATUS.COMPLETED
          // Removed paymentStatus check to include Pay at Home completed bookings too, 
          // as they are revenue even if cash is with vendor (accounted as debt)
        }
      },
      {
        $group: {
          _id: null,
          totalTransactionValue: { $sum: '$finalAmount' },
          totalPlatformRevenue: { $sum: '$adminCommission' },
          totalVendorEarnings: { $sum: '$vendorEarnings' },
          totalTaxCollected: { $sum: '$tax' },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenueStats = revenueDocs[0] || {
      totalTransactionValue: 0,
      totalPlatformRevenue: 0,
      totalVendorEarnings: 0,
      totalTaxCollected: 0,
      count: 0
    };

    // 2. Pending Settlements (What we owe vendors)
    const pendingSettlements = await Settlement.aggregate([
      {
        $match: {
          status: 'PENDING'
        }
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Payment Method Breakdown
    const paymentMethods = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: BOOKING_STATUS.COMPLETED
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$finalAmount' }
        }
      }
    ]);

    // 4. Daily Revenue Trend (last 30 days) - Using Completed At date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          completedAt: { $gte: thirtyDaysAgo }, // Use completedAt for revenue realization
          status: BOOKING_STATUS.COMPLETED
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          revenue: { $sum: '$finalAmount' },
          commission: { $sum: '$adminCommission' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueStats,
        pendingSettlements: pendingSettlements[0] || { totalPendingAmount: 0, count: 0 },
        paymentMethods,
        dailyRevenue
      }
    });

  } catch (error) {
    console.error('Finance overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch finance overview' });
  }
};

/**
 * Get Payment Transactions (Main Report)
 * Detailed transaction log
 */
const getPaymentTransactions = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, status, page = 1, limit = 50, format = 'json' } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('userId', 'name phone')
      .populate('vendorId', 'businessName phone')
      .populate('serviceId', 'title')
      .select('bookingNumber finalAmount adminCommission vendorEarnings tax paymentMethod paymentStatus status createdAt completedAt razorpayPaymentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Booking.countDocuments(query);

    // Calculate totals for the filtered data
    const totals = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$finalAmount' },
          totalCommission: { $sum: '$adminCommission' },
          totalVendorEarnings: { $sum: '$vendorEarnings' },
          totalTax: { $sum: '$tax' }
        }
      }
    ]);

    const reportData = bookings.map(b => ({
      date: b.createdAt,
      bookingNumber: b.bookingNumber,
      service: b.serviceId?.title || 'N/A',
      customer: b.userId?.name || 'Guest',
      vendor: b.vendorId?.businessName || 'Unassigned',
      amount: b.finalAmount || 0,
      platformFee: b.adminCommission || 0,
      vendorEarnings: b.vendorEarnings || 0,
      tax: b.tax || 0,
      paymentMethod: b.paymentMethod || 'N/A',
      paymentStatus: b.paymentStatus || 'N/A',
      bookingStatus: b.status,
      transactionId: b.razorpayPaymentId || '-'
    }));

    if (format === 'csv') {
      return sendCSV(res, reportData, 'payment_transactions');
    }

    res.status(200).json({
      success: true,
      data: reportData,
      totals: totals[0] || { totalAmount: 0, totalCommission: 0, totalVendorEarnings: 0, totalTax: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Payment transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment transactions' });
  }
};

/**
 * Get GSTR-1 Style Report (Sales)
 * Uses global GST Settings (Common GST)
 */
const getGSTRReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Fetch global GST setting
    const settings = await Settings.findOne({ type: 'global' });
    const gstRate = settings?.gstPercentage || 18; // Default 18% if not set

    // CGST/SGST split logic implies 50-50 split of the total GST rate
    const halfRate = gstRate / 2;

    const query = {
      status: BOOKING_STATUS.COMPLETED
    };

    if (startDate && endDate) {
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name phone')
      .select('bookingNumber finalAmount adminCommission tax completedAt paymentMethod address')
      .sort({ completedAt: -1 })
      .lean();

    // Map to GSTR format
    const reportData = bookings.map(b => {
      // If tax is already stored in booking, use it
      // Otherwise calculate from finalAmount (assuming inclusive)
      // taxableValue = finalAmount / (1 + rate/100)

      let taxAmount = b.tax || 0;
      let taxableValue = b.finalAmount - taxAmount;

      // If tax wasn't stored properly but we know rate
      if (taxAmount === 0 && b.finalAmount > 0) {
        // Assume inclusive
        taxableValue = b.finalAmount / (1 + (gstRate / 100));
        taxAmount = b.finalAmount - taxableValue;
      }

      return {
        invoiceDate: b.completedAt ? new Date(b.completedAt).toISOString().split('T')[0] : '',
        invoiceNumber: b.bookingNumber,
        customerName: b.userId?.name || 'Guest',
        placeOfSupply: b.address?.state || 'Madhya Pradesh', // Common/Default state
        hsnSac: '9988',
        taxableValue: parseFloat(taxableValue.toFixed(2)),
        gstRate: `${gstRate}%`,
        cgst: parseFloat((taxAmount / 2).toFixed(2)),
        sgst: parseFloat((taxAmount / 2).toFixed(2)),
        igst: 0, // Simplified: assuming mostly intra-state for now
        totalTax: parseFloat(taxAmount.toFixed(2)),
        invoiceValue: b.finalAmount,
        paymentMode: b.paymentMethod
      };
    });

    // Summary totals
    const summary = reportData.reduce((acc, row) => {
      acc.totalTaxableValue += row.taxableValue;
      acc.totalCGST += row.cgst;
      acc.totalSGST += row.sgst;
      acc.totalIGST += row.igst;
      acc.totalTax += row.totalTax;
      acc.totalInvoiceValue += row.invoiceValue;
      return acc;
    }, { totalTaxableValue: 0, totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0, totalInvoiceValue: 0 });

    if (format === 'csv') {
      return sendCSV(res, reportData, 'gstr1_sales_report');
    }

    res.status(200).json({
      success: true,
      data: reportData,
      summary
    });

  } catch (error) {
    console.error('GSTR report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate GSTR report' });
  }
};

/**
 * Get TDS Report
 * Uses global TDS Settings from Admin
 */
const getTDSReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Fetch TDS setting
    const settings = await Settings.findOne({ type: 'global' });
    const tdsRate = settings?.tdsPercentage || 1; // Default 1% if not set

    const query = {
      status: BOOKING_STATUS.COMPLETED,
      vendorId: { $ne: null }
    };

    if (startDate && endDate) {
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Group by Vendor for the period
    const vendorStats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$vendorId',
          grossSales: { $sum: '$finalAmount' },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $project: {
          vendorName: '$vendor.businessName',
          vendorPhone: '$vendor.phone',
          panNumber: { $ifNull: ['$vendor.panNumber', 'Not Provided'] },
          grossSales: 1,
          tdsRate: { $literal: tdsRate },
          tdsAmount: { $multiply: ['$grossSales', (tdsRate / 100)] }, // Use Admin Setting Rate
          bookingCount: 1
        }
      },
      { $sort: { grossSales: -1 } }
    ]);

    // Summary
    const summary = vendorStats.reduce((acc, row) => {
      acc.totalGrossSales += row.grossSales;
      acc.totalTDS += row.tdsAmount;
      acc.vendorCount++;
      return acc;
    }, { totalGrossSales: 0, totalTDS: 0, vendorCount: 0 });

    if (format === 'csv') {
      return sendCSV(res, vendorStats, 'tds_report_admin');
    }

    res.status(200).json({
      success: true,
      data: vendorStats,
      summary
    });

  } catch (error) {
    console.error('TDS report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate TDS report' });
  }
};

/**
 * Get Cash Collected Report (formerly COD Reconciliation)
 * Track Cash Collected by Vendor vs Commission Owed
 */
const getCODReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.status = BOOKING_STATUS.COMPLETED; // Ensure completed
      // We can use completedAt or cashCollectedAt
      dateFilter.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Get all vendors (even if blocked/unapproved, as they might owe money)
    const vendors = await Vendor.find({})
      .select('businessName phone walletBalance')
      .lean();

    // For each vendor, calculate their cash-related bookings
    const reportData = await Promise.all(vendors.map(async (v) => {
      // Build match query
      const matchQuery = {
        vendorId: v._id,
        $or: [
          { cashCollected: true },
          { paymentMethod: { $in: ['pay_at_home', 'cash', 'COD', 'cod'] } }
        ],
        status: BOOKING_STATUS.COMPLETED
      };

      // Add date filter if present
      if (startDate && endDate) {
        matchQuery.completedAt = dateFilter.completedAt;
      }

      const cashBookings = await Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalCashCollected: { $sum: '$finalAmount' },
            platformCommission: { $sum: '$adminCommission' },
            count: { $sum: 1 }
          }
        }
      ]);

      const cashData = cashBookings[0] || { totalCashCollected: 0, platformCommission: 0, count: 0 };

      // Outstanding dues = Commission they owe platform (if negative wallet, they owe)
      const outstandingDues = v.walletBalance < 0 ? Math.abs(v.walletBalance) : 0;
      const riskLevel = outstandingDues > 5000 ? 'HIGH' : (outstandingDues > 1000 ? 'MEDIUM' : 'LOW');

      return {
        vendorName: v.businessName || 'Unknown',
        phone: v.phone,
        totalCashCollected: cashData.totalCashCollected,
        platformCommissionDue: cashData.platformCommission,
        cashBookingCount: cashData.count,
        walletBalance: v.walletBalance, // Current live wallet status
        outstandingDues,
        riskLevel
      };
    }));

    // Filter to show only vendors with cash dealings or outstanding dues
    const filteredData = reportData.filter(r => r.totalCashCollected > 0 || r.outstandingDues > 0);

    // Sort by outstanding dues (highest first)
    filteredData.sort((a, b) => b.outstandingDues - a.outstandingDues);

    // Summary
    const summary = filteredData.reduce((acc, row) => {
      acc.totalCashCollected += row.totalCashCollected;
      acc.totalOutstandingDues += row.outstandingDues;
      if (row.riskLevel === 'HIGH') acc.highRiskCount++;
      return acc;
    }, { totalCashCollected: 0, totalOutstandingDues: 0, highRiskCount: 0 });

    if (format === 'csv') {
      return sendCSV(res, filteredData, 'cash_collected_report');
    }

    res.status(200).json({
      success: true,
      data: filteredData,
      summary
    });

  } catch (error) {
    console.error('Cash collected report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate cash report' });
  }
};

/**
 * Get Revenue Breakdown
 */
const getRevenueBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Revenue by Service Category
    const byService = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: BOOKING_STATUS.COMPLETED
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$service.title',
          revenue: { $sum: '$finalAmount' },
          commission: { $sum: '$adminCommission' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Revenue by Payment Method
    const byPaymentMethod = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: BOOKING_STATUS.COMPLETED
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$finalAmount' },
          commission: { $sum: '$adminCommission' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by City/State
    const byLocation = await Booking.aggregate([
      {
        $match: {
          ...dateFilter,
          status: BOOKING_STATUS.COMPLETED
        }
      },
      {
        $group: {
          _id: '$address.city',
          revenue: { $sum: '$finalAmount' },
          commission: { $sum: '$adminCommission' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byService,
        byPaymentMethod,
        byLocation
      }
    });

  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue breakdown' });
  }
};

/**
 * Helper to send CSV
 */
const sendCSV = (res, data, filename) => {
  if (!data || data.length === 0) {
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="${filename}_${Date.now()}.csv"`);
    return res.send('No data available');
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const val = row[header] !== undefined ? row[header] : '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename="${filename}_${Date.now()}.csv"`);
  res.send(csvString);
};

module.exports = {
  getFinanceOverview,
  getPaymentTransactions,
  getGSTRReport,
  getTDSReport,
  getCODReport,
  getRevenueBreakdown
};
