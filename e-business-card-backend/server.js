const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Allowed frontend origins (local + deployed)
const allowedOrigins = [
  'http://localhost:5173',
  'https://frontendfinal-git-main-fizz-zakharovs-projects.vercel.app',
  'https://frontendfinal-nine.vercel.app',
];

// CORS setup
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cards', require('./routes/cards'));

// MongoDB Connection
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Serve frontend (if using build output locally)
const frontendPath = path.join(__dirname, '../e-business-card-frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
