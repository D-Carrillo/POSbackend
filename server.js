require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const reportRoutes = require('./routes/reportRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const discountRoutes = require('./routes/discountRoutes');
require('./config/db'); 

const app = express();

// Middleware


const corsOptions = {
  origin: [
    'https://gentle-desert-0fe0da310.6.azurestaticapps.net',
    'http://localhost:3000' // Add if you have local development
  ],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'cache-control',
    'pragma', // Explicitly add pragma
    'x-auth-token', // Common auth header
    'if-modified-since' // For cache control
  ],
  exposedHeaders: [
    'Content-Length',
    'ETag',
    'Last-Modified',
    'Content-Type',
    'Authorization',
    'cache-control',
    'pragma'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight response for 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all OPTIONS requests

app.use(bodyParser.json());


// Routes
app.use('/auth', authRoutes);
app.use('/api', customerRoutes);
app.use('/api', supplierRoutes);
app.use('/api', reportRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/', transactionRoutes);
app.use('/api', discountRoutes);
app.use('/api/notifications', notificationRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
