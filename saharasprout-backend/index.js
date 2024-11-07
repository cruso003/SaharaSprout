require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

// Serve static files for the React Native app
app.use("/", express.static("public"));

// Import routes
const authRoutes = require('./routes/auth');
const testRoute = require('./routes/test');
const moistureRoute = require('./routes/moisture');
const translateRoute = require('./routes/translation');

// Sample Route
app.get('/', (req, res) => {
  res.send('Welcome to SaharaSprout API!');
});

// Use authentication routes
app.use('/auth', authRoutes);
app.use('/api', testRoute);
app.use('/api', moistureRoute);
app.use('/api', translateRoute);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});