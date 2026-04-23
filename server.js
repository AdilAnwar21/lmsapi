const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const morgan = require('morgan');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.json());
app.use('/api', globalLimiter);
// const apiRoutes = require('./routes/api');
// app.use('/api', apiRoutes);
// app.use('/uploads', express.static('uploads'));


//routes import
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const adminCategoryRoutes = require('./routes/admin.category.routes');
const adminCourseRoutes = require('./routes/admin.course.routes');
//setup for production


//--------------------------------------------------

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));


//Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/courses', adminCourseRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Mellou Billing API is running');
});




// 1. Handle Unhandled Routes (404)
const AppError = require('./utils/AppError');
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 2. The Global Error Handler (MUST BE LAST)
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);



// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
