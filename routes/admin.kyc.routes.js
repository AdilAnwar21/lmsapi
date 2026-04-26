const express = require('express');
const router = express.Router();
const kycController = require('../controllers/admin.kyc.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.use(verifyToken);

// Form Builder (Requires setting permission)
router.post('/kyc-fields', checkPermission('settings:manage'), kycController.createField);
router.get('/kyc-fields', checkPermission('settings:manage'), kycController.getAllFields);
router.put('/kyc-fields/:id', checkPermission('settings:manage'), kycController.updateField);

// KYC Review (Requires user management permission)
router.put('/kyc-review/:kycId', checkPermission('user:edit'), kycController.reviewStudentKyc);


module.exports = router;