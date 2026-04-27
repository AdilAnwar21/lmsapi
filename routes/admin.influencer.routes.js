const express = require('express');
const router = express.Router();
const influencerController = require('../controllers/admin.influencer.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.use(verifyToken);

// Create
router.post('/', checkPermission('settings:manage'), influencerController.createInfluencer);

// Get All (Unpaginated)
router.get('/', checkPermission('settings:manage'), influencerController.getAllInfluencers);

// Get Filtered/Paginated (MUST be before /:id)
router.get('/filter', checkPermission('settings:manage'), influencerController.getAllInfluencersFilter);

// Get Single by ID
router.get('/:id', checkPermission('settings:manage'), influencerController.getInfluencerById);

// Update
router.put('/:id', checkPermission('settings:manage'), influencerController.updateInfluencer);

module.exports = router;