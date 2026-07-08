const express = require('express');
const router = express.Router();
const { uploadImage } = require('../../middleware/uploadMiddleware');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');

// Upload single file to Cloudinary with offline local fallback
router.post('/upload', uploadImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Try to upload the local file to Cloudinary
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'appzeto'
      });
      
      // Successfully uploaded to Cloudinary, delete the local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting local temp file:', err);
      }
      
      return res.status(200).json({
        success: true,
        imageUrl: result.secure_url,
        message: 'File uploaded successfully to Cloudinary'
      });
    } catch (cloudinaryErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryErr.message);
      
      // Construct local serving URL
      const relativePath = `/uploads/${req.file.filename}`;
      let baseUrl = '';
      
      // Check hostname/port to build base URL
      if (req.headers.host) {
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
        baseUrl = `${protocol}://${req.headers.host}`;
      } else {
        baseUrl = 'http://localhost:5000';
      }
      
      const localUrl = `${baseUrl}${relativePath}`;
      
      return res.status(200).json({
        success: true,
        imageUrl: localUrl,
        message: 'File saved locally (offline mode fallback)'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

module.exports = router;
