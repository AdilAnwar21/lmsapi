const express = require('express');
const router = express.Router();

const studentKycController = require('../controllers/student.kyc.controller');
import { verifyToken } from '../middleware/auth.middleware';

// Notice: No permissions needed here, just verifyToken!
router.get('/onboarding-form', verifyToken, studentKycController.getOnboardingForm);
router.post('/onboarding-submit', verifyToken, studentKycController.submitOnboarding);


module.exports = router;