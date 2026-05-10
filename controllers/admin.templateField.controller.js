const TemplateField = require('../models/TemplateField');
const AssessmentTemplate = require('../models/AssessmentTemplate'); // To verify parent exists

// ==========================================
// 1. GET ALL FIELDS FOR A TEMPLATE
// ==========================================
exports.getTemplateFields = async (req, res) => {
  try {
    const { template_id } = req.params;

    // Fetch all questions for this template, ordered exactly how the admin arranged them
    const fields = await TemplateField.find({ template_id }).sort({ order_index: 1 });

    return res.status(200).json({
      success: true,
      data: fields
    });
  } catch (error) {
    console.error('Error fetching template fields:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching questions.' });
  }
};

// ==========================================
// 2. THE BULK SYNC API (Upsert & Delete)
// ==========================================
exports.syncTemplateFields = async (req, res) => {
  try {
    const { template_id } = req.params;
    const { fields } = req.body;

    // 1. Verify the array exists
    if (!Array.isArray(fields)) {
      return res.status(400).json({ success: false, message: 'Fields must be provided as an array.' });
    }

    // 2. Verify the parent template actually exists
    const templateExists = await AssessmentTemplate.findById(template_id);
    if (!templateExists) {
      return res.status(404).json({ success: false, message: 'Assessment Template not found.' });
    }

    // 3. Extract the IDs of all questions the frontend sent
    // If a field doesn't have an _id, it's undefined, which gets filtered out.
    const incomingIds = fields.filter(f => f._id).map(f => f._id);

    // 4. DELETE SMARTLY: Delete any questions in the DB for this template 
    // that are NOT included in the incomingIds array.
    await TemplateField.deleteMany({
      template_id: template_id,
      _id: { $nin: incomingIds } // "$nin" = Not In
    });

    // 5. Prepare the Bulk Write array for Creates and Updates
    const bulkOps = [];

    fields.forEach((field) => {
      if (field._id) {
        // UPDATE EXISTING QUESTION
        bulkOps.push({
          updateOne: {
            filter: { _id: field._id, template_id: template_id },
            update: { 
              $set: {
                input_type: field.input_type,
                label: field.label,
                points: field.points || 0,
                options_config: field.options_config || {},
                order_index: field.order_index,
                is_required: field.is_required !== undefined ? field.is_required : true
              } 
            }
          }
        });
      } else {
        // CREATE NEW QUESTION
        bulkOps.push({
          insertOne: {
            document: {
              template_id: template_id,
              input_type: field.input_type,
              label: field.label,
              points: field.points || 0,
              options_config: field.options_config || {},
              order_index: field.order_index,
              is_required: field.is_required !== undefined ? field.is_required : true
            }
          }
        });
      }
    });

    // 6. Execute all Creates and Updates in one massive database hit
    if (bulkOps.length > 0) {
      await TemplateField.bulkWrite(bulkOps);
    }

    // 7. Fetch and return the newly synchronized list so the frontend has the fresh IDs
    const updatedFields = await TemplateField.find({ template_id }).sort({ order_index: 1 });

    return res.status(200).json({
      success: true,
      message: 'Questions synchronized successfully.',
      data: updatedFields
    });

  } catch (error) {
    console.error('Error syncing template fields:', error);
    return res.status(500).json({ success: false, message: 'Server error while saving questions.' });
  }
};