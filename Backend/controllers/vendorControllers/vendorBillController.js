const VendorBill = require('../../models/VendorBill');
const Booking = require('../../models/Booking');
const VendorServiceCatalog = require('../../models/VendorServiceCatalog');
const VendorPartsCatalog = require('../../models/VendorPartsCatalog');
const Settings = require('../../models/Settings');
const { BILL_STATUS } = require('../../utils/constants');

/**
 * Create or Update Vendor Bill
 * POST /api/vendors/bookings/:bookingId/bill
 */
const createOrUpdateBill = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { services, parts, customItems } = req.body;
    const vendorId = req.user.id; // From authMiddleware

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.vendorId.toString() !== vendorId) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    // --- 1. Calculate Original Service Totals (User Selected) ---
    // Assuming booking.basePrice is the ex-tax base price of the original service
    // Default 18% GST for original service
    const originalServiceBase = booking.basePrice || 0;
    const originalServiceGST = (originalServiceBase * 18) / 100;
    // const originalServiceTotal = originalServiceBase + originalServiceGST; // This is theoretically booking.finalAmount, but we recalculate to be safe

    // --- 2. Calculate Vendor Extra Services (Add-ons) ---
    // Assumption: Catalog prices for services are INCLUSIVE of GST (18%) -> need to derive base
    // OR Assumption from prompt: "Vendor Service Base = 1000, GST 18$ = 180" -> implies inputs might be base or inclusive.
    // Let's stick to standard: Backend treats inputs as Base Price if specified, or derives if inclusive.
    // prompt says: "Vendor Service GST = vendor_service_base * gst%"
    // But usually frontend sends "price".
    // Let's assume frontend sends the "Price" that the customer sees.
    // To match the prompt's explicit separation: "vendor_service_base + GST", we need to know if the input 'price' is Base or Total.
    // Standard e-commerce/billing: Items are usually tax-inclusive in display, or tax-exclusive in definition.
    // In previous code: "Service Catalog Prices are INCLUSIVE".
    // Let's CONTINUE that assumption for Catalog Items.
    // For Custom Items/Manual Entry: We treat input price as BASE price to keep it simple, or aligned with catalog.
    // CORRECT APPROACH based on prompt "Vendor Service Base = 1000":
    // We will calculate Base and GST for every item.

    let vendorServicesBaseTotal = 0;
    let vendorServicesGSTTotal = 0;
    // let vendorServicesGrandTotal = 0;

    const processedServices = [];
    if (services && Array.isArray(services)) {
      for (const item of services) {
        let catalogItem = null;
        if (item.catalogId) {
          catalogItem = await VendorServiceCatalog.findById(item.catalogId);
        }

        const name = catalogItem ? catalogItem.name : item.name;
        // Catalog Price is usually inclusive. Let's derive Base from it.
        // Price = Base * 1.18 => Base = Price / 1.18
        const unitPriceInclusive = catalogItem ? catalogItem.price : (Number(item.price) || 0);
        const quantity = Number(item.quantity) || 1;
        const totalInclusive = unitPriceInclusive * quantity;

        // Extract Base
        const taxableBase = totalInclusive / 1.18;
        const gstAmount = totalInclusive - taxableBase;

        processedServices.push({
          catalogId: item.catalogId,
          name,
          price: unitPriceInclusive, // Store what user sees
          quantity,
          total: totalInclusive,
          basePrice: taxableBase,
          gstAmount
        });

        vendorServicesBaseTotal += taxableBase;
        vendorServicesGSTTotal += gstAmount;
        // vendorServicesGrandTotal += totalInclusive;
      }
    }

    // --- 3. Calculate Parts ---
    // Prompt: "Vendor gets 10% of PART BASE". "Part Total = part_base + GST"
    // Usually parts prices are entered as Base Price + Tax.
    // Let's assume input price for parts is BASE PRICE (since they often have variable tax rates).

    let partsBaseTotal = 0;
    let partsGSTTotal = 0;
    // let partsGrandTotal = 0;

    const processedParts = [];
    if (parts && Array.isArray(parts)) {
      for (const item of parts) {
        let catalogItem = null;
        if (item.catalogId) {
          catalogItem = await VendorPartsCatalog.findById(item.catalogId);
        }

        const name = catalogItem ? catalogItem.name : item.name;
        // Assume price is Base Price
        const unitBasePrice = catalogItem ? catalogItem.price : (Number(item.price) || 0);
        const quantity = Number(item.quantity) || 1;
        const gstPercentage = catalogItem ? catalogItem.gstPercentage : (Number(item.gstPercentage) || 18);

        const totalBase = unitBasePrice * quantity;
        const gstAmount = (totalBase * gstPercentage) / 100;
        const totalInclusive = totalBase + gstAmount;

        processedParts.push({
          catalogId: item.catalogId,
          name,
          price: unitBasePrice, // Base price
          gstPercentage,
          quantity,
          gstAmount,
          total: totalInclusive
        });

        partsBaseTotal += totalBase;
        partsGSTTotal += gstAmount;
        // partsGrandTotal += totalInclusive;
      }
    }

    // --- 4. Process Custom Items (Misc) ---
    // Treat as parts logic (Base + Tax)
    let customBaseTotal = 0;
    let customGSTTotal = 0;

    const processedCustomItems = [];
    if (customItems && Array.isArray(customItems)) {
      for (const item of customItems) {
        const name = item.name;
        const unitBasePrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const gstApplicable = item.gstApplicable !== false;
        const gstPercentage = gstApplicable ? (Number(item.gstPercentage) || 18) : 0;

        const totalBase = unitBasePrice * quantity;
        const gstAmount = (totalBase * gstPercentage) / 100;
        const totalInclusive = totalBase + gstAmount;

        processedCustomItems.push({
          name,
          price: unitBasePrice,
          gstApplicable,
          gstPercentage,
          quantity,
          gstAmount,
          total: totalInclusive
        });

        customBaseTotal += totalBase;
        customGSTTotal += gstAmount;
      }
    }

    // --- 5. Final Aggregation ---

    const totalServiceBase = originalServiceBase + vendorServicesBaseTotal;
    const totalPartsBase = partsBaseTotal + customBaseTotal; // Treating custom items as parts/misc

    const totalServiceGST = originalServiceGST + vendorServicesGSTTotal;
    const totalPartsGST = partsGSTTotal + customGSTTotal;

    const finalBillAmount = (totalServiceBase + totalServiceGST) + (totalPartsBase + totalPartsGST);

    // --- 6. Vendor Wallet Calculation (The Core Logic) ---
    // Vendor Service Earnings = 70% of Total Service Base
    const vendorServiceEarnings = totalServiceBase * 0.70;

    // Vendor Parts Earnings = 10% of Total Parts Base
    const vendorPartsEarnings = totalPartsBase * 0.10;

    // Total Vendor Wallet Credit
    // GST is strictly excluded from vendor share
    const vendorEarnings = vendorServiceEarnings + vendorPartsEarnings;

    // Admin/Company Share (Revenue)
    // = Final Bill - Vendor Payout
    // (This automatically includes 100% of GST + 30% service margin + 90% parts margin)
    const adminRevenue = finalBillAmount - vendorEarnings;

    // --- 7. Save Bill ---
    let bill = await VendorBill.findOne({ bookingId });
    if (bill) {
      bill.services = processedServices;
      bill.parts = processedParts;
      bill.customItems = processedCustomItems;
      bill.totalServiceCharges = (totalServiceBase + totalServiceGST);
      bill.totalPartsCharges = (partsBaseTotal + partsGSTTotal); // Store only parts category here
      bill.totalCustomCharges = (customBaseTotal + customGSTTotal);
      bill.grandTotal = finalBillAmount;
      bill.status = BILL_STATUS.GENERATED;
      await bill.save();
    } else {
      bill = await VendorBill.create({
        bookingId,
        vendorId,
        services: processedServices,
        parts: processedParts,
        customItems: processedCustomItems,
        totalServiceCharges: (totalServiceBase + totalServiceGST),
        totalPartsCharges: (partsBaseTotal + partsGSTTotal),
        totalCustomCharges: (customBaseTotal + customGSTTotal),
        grandTotal: finalBillAmount,
        status: BILL_STATUS.GENERATED
      });
    }

    // --- 8. Update Booking Financials ---
    booking.finalAmount = Math.round(finalBillAmount);
    // userPayableAmount should match finalAmount in this pay-after model
    booking.userPayableAmount = Math.round(finalBillAmount);

    booking.vendorEarnings = Math.round(vendorEarnings);
    booking.adminCommission = Math.round(adminRevenue); // We store Company Revenue as 'adminCommission' field for now

    // Ensure payment status is PENDING if amount changed
    if (booking.paymentStatus === 'PAID' && booking.finalAmount > (booking.paidAmount || 0)) {
      // If already paid partial, might need logic. assuming pay-after means mostly pending.
      // logic: if new bill generated, usually pending unless confirmed.
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Bill generated successfully',
      bill,
      financials: {
        grandTotal: Math.round(finalBillAmount),
        vendorEarnings: Math.round(vendorEarnings),
        companyRevenue: Math.round(adminRevenue),
        breakdown: {
          serviceBase: Math.round(totalServiceBase),
          partsBase: Math.round(totalPartsBase),
          totalGST: Math.round(totalServiceGST + totalPartsGST)
        }
      }
    });

  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate bill' });
  }
};

/**
 * Get Bill by Booking ID
 * GET /api/vendors/bookings/:bookingId/bill
 */
const getBillByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bill = await VendorBill.findOne({ bookingId }).populate('services.catalogId parts.catalogId');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bill' });
  }
};

module.exports = {
  createOrUpdateBill,
  getBillByBookingId
};
