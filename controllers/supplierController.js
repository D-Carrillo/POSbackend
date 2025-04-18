const Supplier = require('../models/Supplier');
exports.register = async (req, res) => {
  try {
    if (!req.body.email || typeof req.body.email !== 'string') {
      return res.status(400).send('Valid email required');
    }
    
    if (!req.body.phoneNumber || typeof req.body.phoneNumber !== 'string' || !/^\d{10}$/.test(req.body.phoneNumber)) {
      return res.status(400).send('Valid 10-digit phone number required');
    }

    const existing = await new Promise((resolve, reject) => {
      Supplier.findByEmail(
        String(req.body.email), 
        String(req.body.phoneNumber), 
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    if (existing.length > 0) {
      return res.status(409).send('Email or phone already exists');
    }

    const createdUser = await new Promise((resolve, reject) => {
      Supplier.create({
        ...req.body,
        phoneNumber: String(req.body.phoneNumber)
      }, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    const newUser = await new Promise((resolve, reject) => {
      Supplier.findByEmail(String(req.body.email), String(req.body.email), (err, results) => {
        if (err) reject(err);
        if (!results || results.length === 0) {
          reject(new Error('User not found after creation'));
        }
        resolve(results[0]);
      });
    });

    delete newUser.password;
    return res.json({
      success: true,
      user: {
        first_name: newUser.first_name,
        last_Name: newUser.last_Name,
        id: newUser.Supplier_ID,
        type: 'supplier'
      }
    });

  } catch (err) {
    console.error("Registration error:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).send('Duplicate entry detected');
    }
    
    if (err.message === 'User not found after creation') {
      return res.status(500).send('Registration completed but user lookup failed');
    }
    
    return res.status(500).send('Registration failed');
  }
};