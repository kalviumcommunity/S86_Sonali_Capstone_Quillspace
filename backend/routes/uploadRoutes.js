const express = require('express');
const router = express.Router();
const upload = require('../services/uploadService');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @route   POST /api/upload
 * @desc    Upload a single image
 * @access  Private
 */
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    // Return the file path relative to the uploads folder
    const imageUrl = `/uploads/${req.file.filename}`;

    sendSuccess(res, 200, 'Image uploaded successfully', {
      imageUrl,
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    sendError(res, 500, 'Image upload failed');
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images
 * @access  Private
 */
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'No files uploaded');
    }

    const imageUrls = req.files.map((file) => ({
      imageUrl: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    }));

    sendSuccess(res, 200, 'Images uploaded successfully', {
      images: imageUrls,
      count: req.files.length,
    });
  } catch (error) {
    sendError(res, 500, 'Images upload failed');
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File size is too large. Maximum size is 5MB');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, 400, 'Too many files. Maximum is 5 files');
    }
    return sendError(res, 400, error.message);
  }
  
  if (error) {
    return sendError(res, 400, error.message);
  }
  
  next();
});

module.exports = router;
