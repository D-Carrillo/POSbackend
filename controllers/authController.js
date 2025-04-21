
const db = require('../config/db');

exports.login = (req, res) => {
  const { email, password, typeOfUser } = req.body;

  let table, idField;
  
  if (typeOfUser === 'customer') {
    table = 'customer';
    idField = 'Customer_ID';
  } else if (typeOfUser === 'supplier') {
    table = 'supplier';
    idField = 'Supplier_ID';
  }

  const query = `SELECT first_name, last_Name, password, ${idField} FROM ${table} WHERE Email = ? AND is_deleted = 0`;
  
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    
    if (results.length === 0 && typeOfUser === 'supplier') {
    const adminQuery = `SELECT * FROM administrators WHERE email = ? AND is_deleted = 0`; 
  
  db.query(adminQuery, [email], (adminErr, adminResults) => {
    if (adminErr) {
      console.error('Admin query error:', adminErr);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (adminResults.length === 0) {
      return res.status(401).json({ message: 'Account not found' });
    }
    
    const admin = adminResults[0];
    
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      user: {
        first_name: admin.name,
        middle_Initial: admin.middle_Initial,
        last_Name: admin.last_Name,
        id: admin.admin_ID,
        type: 'admin',
        is_admin: true
      }
    });
  });
  return;
}

    if (results.length === 0) {
      return res.status(401).json({ message: 'Account not found' });
    }
    

    const user = results[0];
    
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      user: {
        first_name: user.first_name,
        last_Name: user.last_Name,
        id: user[idField],
        type: table,
        is_admin: false
      }
    });
  });
};


exports.getUser = async (req, res) => {
  try {
    const { id, type } = req.params;

    if (type === 'admin') {
      const query = 'SELECT * FROM administrators WHERE admin_ID = ?';
      db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Admin not found' });
        
        const admin = results[0];
        delete admin.password;
        
        res.json(admin);
      });
      return;
    }
    
    const table = type === 'customer' ? 'customer' : 'supplier';
    const idField = type === 'customer' ? 'Customer_ID' : 'Supplier_ID';
    
    const query = `SELECT * FROM ${table} WHERE ${idField} = ?`;
    db.query(query, [id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      
      const user = results[0];
      delete user.password; 

      res.json(user);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
      const { id, type } = req.params;
      const updates = req.body;
      
      
      if (!['customer', 'supplier'].includes(type)) {
          return res.status(400).json({
              success: false,
              error: 'Invalid user type'
          });
      }

      const fields = Object.keys(updates);
      if (fields.length === 0) {
          return res.status(400).json({
              success: false,
            error: 'No fields to update'
          });
      }

      const idField = type === 'customer' ? 'Customer_ID' : 'Supplier_ID';
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(id);

      const query = `UPDATE ${type} SET ${setClause} WHERE ${idField} = ?`;
        
      db.query(query, values, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            error: 'Database error during update'
          });
        }
            
        if (result.affectedRows === 0) {
          return res.status(404).json({
              success: false,
              error: 'User not found'
              });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
            });
      });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during update'
        });
    }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id, type } = req.params;
    const tableName = type === 'customer' ? 'customer' : 'supplier';
    const idField = type === 'customer' ? 'Customer_ID' : 'Supplier_ID';

    
    await db.promise().query(
      `UPDATE ${tableName} SET is_deleted = TRUE WHERE ${idField} = ?`,
      [id]
    );

    
    if (type === 'supplier') {
      await db.promise().query(
        `UPDATE item SET is_deleted = TRUE WHERE supplier_id = ?`,
        [id]
      );
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during deletion'
    });
  }
};