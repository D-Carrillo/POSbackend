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
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000', // EXACT origin
  credentials: true, // Required for cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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
