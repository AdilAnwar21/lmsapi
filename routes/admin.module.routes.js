const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/admin.module.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.use(verifyToken);

router.post('/', checkPermission('course:create'), moduleController.createModule);
router.patch('/:id', checkPermission('course:edit'), moduleController.updateModule);
router.delete('/:id', checkPermission('course:delete'), moduleController.deleteModule);

module.exports = router;
