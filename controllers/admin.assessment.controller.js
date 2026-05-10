const AssessmentTemplate = require('../models/AssessmentTemplate');

// ==========================================
// 1. CREATE TEMPLATE (Step 1 of Wizard)
// ==========================================
exports.createTemplate = async (req, res) => {
  try {
    const { title, type, duration_minutes, passing_score } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Template title is required.' });
    }

    const newTemplate = await AssessmentTemplate.create({
      title,
      type: type || 'QUIZ',
      duration_minutes: duration_minutes || 0,
      passing_score: passing_score || null
    });

    // We return the newly created _id so your Angular frontend can store it 
    // and use it for the next step (adding questions)
    return res.status(201).json({
      success: true,
      message: 'Template created successfully.',
      data: newTemplate
    });

  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating template.' });
  }
};

// ==========================================
// 2. GET ALL TEMPLATES (For List/Preview)
// ==========================================
// ==========================================
// 2. GET ALL TEMPLATES (Paginated List)
// ==========================================
exports.getAllTemplates = async (req, res) => {
    try {
      // 1. Get pagination params from URL (default to page 1, 10 items)
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;
  
      // 2. Run queries in parallel for performance
      const [total, templates] = await Promise.all([
        AssessmentTemplate.countDocuments(),
        AssessmentTemplate.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ]);
  
      // 3. Return data along with pagination metadata
      return res.status(200).json({
        success: true,
        data: templates,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      return res.status(500).json({ success: false, message: 'Server error while fetching templates.' });
    }
  };

// ==========================================
// 3. GET TEMPLATE BY ID (For Editing)
// ==========================================
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await AssessmentTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching template.' });
  }
};

// ==========================================
// 4. UPDATE TEMPLATE CORE DETAILS
// ==========================================
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, duration_minutes, passing_score } = req.body;

    const updatedTemplate = await AssessmentTemplate.findByIdAndUpdate(
      id,
      {
        title,
        type,
        duration_minutes,
        passing_score
      },
      { new: true, runValidators: true } // Return the updated document & run schema checks
    );

    if (!updatedTemplate) {
      return res.status(404).json({ success: false, message: 'Template not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Template updated successfully.',
      data: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating template.' });
  }
};