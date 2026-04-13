const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/admin.category.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Protect all category routes
router.use(verifyToken);

// Create Category (Requires course:create permission)
router.post('/', checkPermission('course:create'), categoryController.createCategory);

// Get All Categories (Requires course:view permission)
router.get('/', checkPermission('course:view'), categoryController.getAllCategories);



router.get('/filter', checkPermission('course:view'), categoryController.getAllCategoriesFilter);



// Update Category (Requires course:edit permission)
router.put('/:id', checkPermission('course:edit'), categoryController.updateCategory);

// Soft Delete Category (Requires course:delete permission)
router.delete('/:id', checkPermission('course:delete'), categoryController.deleteCategory);

module.exports = router;