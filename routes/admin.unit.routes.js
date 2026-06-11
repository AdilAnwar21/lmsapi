const express = require('express');
const router = express.Router();
const unitController = require('../controllers/admin.unit.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.use(verifyToken);

router.post('/', checkPermission('course:create'), unitController.createLearningUnit);
router.patch('/:id', checkPermission('course:edit'), unitController.updateLearningUnit);
router.delete('/:id', checkPermission('course:delete'), unitController.deleteLearningUnit);

module.exports = router;
