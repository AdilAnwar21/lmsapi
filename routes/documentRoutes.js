const express = require('express');
const router = express.Router();
const { upload } = require('../config/r2Storage');
const { uploadDocument, getDocumentUrl } = require('../controllers/documentController');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// @route   POST /api/admin/documents/upload
// @desc    Upload a document directly to Cloudflare R2
// @access  Private
// Authentication applied, multer single file middleware ('file' field)
router.post(
  '/upload',
  verifyToken,
  upload.single('file'),
  uploadDocument
);

// @route   GET /api/admin/documents/:id
// @desc    Get a temporary signed URL for viewing a document securely
// @access  Private
// Authentication applied
router.get(
  '/:id',
  verifyToken,
  getDocumentUrl
);

module.exports = router;
