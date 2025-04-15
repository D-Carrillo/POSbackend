const Supplier = require('../models/Supplier');

exports.register = (req, res) => {
  Supplier.findByEmail(req.body.email, (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) return res.status(409).send('Email already exists');

    Supplier.create(req.body, (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send('Error inserting data');
      }

      Supplier.findByEmail(req.body.email, (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(401).send('Invalid Credentials');

        const user = results[0];
        delete user.password;
        res.json({
          success: true,
          user: {
            first_name: user.first_name,
            last_Name: user.last_Name,
            id: user.Supplier_ID,
            type: 'supplier'
          }
        });
      });
    });
  });
};

