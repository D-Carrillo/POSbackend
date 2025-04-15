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
  origin: 'https://gentle-desert-0fe0da310.6.azurestaticapps.net',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,cache-control',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly allow preflight across routes

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
