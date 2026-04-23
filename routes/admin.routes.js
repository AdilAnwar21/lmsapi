const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/admin.auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

const adminUserController = require('../controllers/admin.user.controller');
const adminUtilsController = require('../controllers/admin.utils.controller');
const { checkPermission } = require('../middleware/permission.middleware');

// Public Admin Routes (No token needed yet)
router.post('/auth/login',authLimiter, adminAuthController.login);
router.post('/auth/login/2fa',authLimiter, adminAuthController.loginWith2FA);


router.post('/auth/logout', verifyToken, adminAuthController.logout);



router.post('/auth/complete-setup', authLimiter, adminAuthController.completeSetup);

// Protected Admin Routes (Requires standard token)
router.post('/auth/2fa/setup', verifyToken, adminAuthController.setup2FA);
router.post('/auth/2fa/verify', verifyToken, adminAuthController.verify2FASetup);



router.post(
    '/team', 
    verifyToken, 
    checkPermission('team:create'), 
    adminUserController.createTeamMember
);

// Get Paginated List of All Users (Requires 'user:view' permission)
router.get(
    '/users', 
    verifyToken, 
    checkPermission('user:view'), 
    adminUserController.getAllUsers
);

router.get('/users/me', verifyToken, adminAuthController.getMe);


// Get a single user by ID
router.get('/users/:id', verifyToken, checkPermission('user:view'), adminUserController.getUserById);

// Update a user (Requires 'team:edit' permission)
router.put('/users/:id', verifyToken, checkPermission('team:edit'), adminUserController.updateTeamMember);

// Delete a user (Requires 'team:edit' or a specific 'team:delete' permission)
router.delete('/users/:id', verifyToken, checkPermission('team:edit'), adminUserController.deleteTeamMember);




router.get('/permissions',verifyToken,adminUserController.getAllPermissions)

router.post(
    '/utils/encode', 
    verifyToken, 
    adminUtilsController.generateEncodedQuery
);

module.exports = router;