const express = require('express');
const path = require('path');   
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
// ...existing code...
app.use('/api/menu', require('./routes/menu'));
// ...existing code...

// ...existing code...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ...existing code...

app.get('/', (req, res) => {
  res.send('BACKEND STARTED');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});