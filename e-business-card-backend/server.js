const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// === CORS Configuration ===
const allowedOrigins = [
  'https://frontendfinal-git-main-fizz-zakharovs-projects.vercel.app',
  'https://frontendfinal-nine.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true, // if you're using cookies/auth headers
}));

// Preflight support
app.options('*', cors());

// === Body Parsing Middleware ===
app.use(express.json());

// === API Routes ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cards', require('./routes/cards'));

// === MongoDB Connection ===
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// === Serve Static Frontend Files ===
const frontendPath = path.join(__dirname, '../e-business-card-frontend/dist');
app.use(express.static(frontendPath));

// === Fallback Route for SPA ===
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
