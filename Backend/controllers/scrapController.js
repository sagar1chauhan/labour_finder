const Scrap = require('../models/Scrap');
const { validationResult } = require('express-validator');
const { createNotification } = require('./notificationControllers/notificationController');

// Create a new scrap item (User)
exports.createScrap = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, quantity, expectedPrice, images, address } = req.body;

    const scrap = new Scrap({
      userId: req.user.id,
      title,
      description,
      category,
      quantity,
      expectedPrice,
      images,
      address
    });

    await scrap.save();

    res.status(201).json({
      success: true,
      data: scrap,
      message: 'Scrap item listed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get list of scrap items for the logged-in user
exports.getMyScrap = async (req, res) => {
  try {
    const scraps = await Scrap.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: scraps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get scrap items accepted by vendor
exports.getMyAcceptedScrap = async (req, res) => {
  try {
    const scraps = await Scrap.find({ vendorId: req.user.id })
      .populate('userId', 'name phone address')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: scraps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all pending scrap items (Vendor view)
// Can filter by nearby location logic
exports.getAvailableScrap = async (req, res) => {
  try {
    // Return all pending items
    const scraps = await Scrap.find({ status: 'pending' })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: scraps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Vendor accepts/buys a scrap request
exports.acceptScrap = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id; // vendor middleware ensures this

    const scrap = await Scrap.findById(id);
    if (!scrap) return res.status(404).json({ success: false, message: 'Scrap item not found' });

    if (scrap.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Item already taken or cancelled' });
    }

    scrap.status = 'accepted';
    scrap.vendorId = vendorId;
    scrap.pickupDate = new Date(); // Default to now, or accept from body
    await scrap.save();

    // Notify User
    await createNotification({
      userId: scrap.userId,
      type: 'SCRAP_ACCEPTED',
      title: 'Scrap Request Accepted!',
      message: `A vendor has accepted your scrap request for "${scrap.title}". They will contact you shortly.`,
      relatedId: scrap._id,
      relatedType: 'SCRAP'
    });

    res.json({ success: true, data: scrap, message: 'Request accepted. Please contact user for pickup.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Vendor marks item as picked up / completed
exports.completeScrap = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalPrice } = req.body;

    const scrap = await Scrap.findById(id);
    if (!scrap) return res.status(404).json({ success: false, message: 'Scrap item not found' });

    if (scrap.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    scrap.status = 'completed';
    if (finalPrice) scrap.finalPrice = finalPrice;
    await scrap.save();

    // Notify User
    await createNotification({
      userId: scrap.userId,
      type: 'SCRAP_COMPLETED',
      title: 'Scrap Pickup Completed',
      message: `Your scrap item "${scrap.title}" has been successfully picked up and completed.`,
      relatedId: scrap._id,
      relatedType: 'SCRAP'
    });

    res.json({ success: true, data: scrap, message: 'Transactions completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all scrap items
exports.getAllScrapAdmin = async (req, res) => {
  try {
    const scraps = await Scrap.find({})
      .populate('userId', 'name email phone')
      .populate('vendorId', 'name businessName phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: scraps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get single scrap by ID
exports.getScrapById = async (req, res) => {
  try {
    const scrap = await Scrap.findById(req.params.id)
      .populate('userId', 'name phone email profilePhoto')
      .populate('vendorId', 'name businessName phone profilePhoto');

    if (!scrap) {
      return res.status(404).json({ success: false, message: 'Scrap not found' });
    }

    res.json({ success: true, data: scrap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
