const express = require('express');
const router = express.Router();

const assessmentController = require('../controllers/admin.assessment.controller');
const fieldController = require('../controllers/admin.templateField.controller');

// --- PHASE 1: Parent Template Routes ---
router.post('/', assessmentController.createTemplate);
router.get('/', assessmentController.getAllTemplates);
router.get('/:id', assessmentController.getTemplateById);
router.put('/:id', assessmentController.updateTemplate);

// --- PHASE 2: Child Field Routes ---
// Get all questions for a specific template
router.get('/:template_id/fields', fieldController.getTemplateFields);

// Bulk Sync (Upsert/Delete) questions for a specific template
router.put('/:template_id/fields/sync', fieldController.syncTemplateFields);

module.exports = router;