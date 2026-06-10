const Document = require('../models/Document');
const { s3Client } = require('../config/r2Storage');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/**
 * @desc    Upload document
 * @route   POST /api/admin/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format.' });
    }

    // req.file is populated by multer-s3
    const { originalname, mimetype, size, key } = req.file;

    // Use req.user.id or _id depending on the token payload structure.
    // Ensure the user is authenticated
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, message: 'User not authenticated properly.' });
    }

    const uploadedBy = req.user.id || req.user._id;

    // Save document metadata to database
    const document = await Document.create({
      original_name: originalname,
      r2_key: key,
      mime_type: mimetype,
      size_bytes: size,
      uploaded_by: uploadedBy
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: document
    });
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error. Failed to upload document.'
    });
  }
};

/**
 * @desc    Get secure pre-signed URL for document
 * @route   GET /api/admin/documents/:id
 * @access  Private
 */
const getDocumentUrl = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document in database
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Check if the environment variable for R2 Bucket Name exists
    if (!process.env.R2_BUCKET_NAME) {
      console.error('R2_BUCKET_NAME environment variable is missing.');
      return res.status(500).json({ success: false, message: 'Storage configuration error.' });
    }

    // Create the command for the S3 client
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: document.r2_key
    });

    // Generate signed URL expiring in 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return res.status(200).json({
      success: true,
      data: {
        document: {
          _id: document._id,
          original_name: document.original_name,
          mime_type: document.mime_type,
          size_bytes: document.size_bytes,
          uploaded_by: document.uploaded_by,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        },
        url: signedUrl
      }
    });
  } catch (error) {
    console.error('Error in getDocumentUrl:', error);
    // Handle invalid Object ID format specifically
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Document ID format.' });
    }
    return res.status(500).json({
      success: false,
      message: 'Server Error. Failed to generate document URL.'
    });
  }
};

module.exports = {
  uploadDocument,
  getDocumentUrl
};
