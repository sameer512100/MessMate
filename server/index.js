const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected ✅'))
.catch((err) => {
  console.error('MongoDB connection error ❌:', err.message);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/user', require('./routes/user'));

app.use('/api/history', require('./routes/mealHistory'));

// Health check/test route
app.get('/test', (req, res) => res.send('ok'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));