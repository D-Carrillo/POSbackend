
const db = require('../config/db');

exports.login = (req, res) => {
    const { email, password, typeOfUser } = req.body;
  
    let table, idField;
    
    if (typeOfUser === 'customer') {
      table = 'customer';
      idField = 'Customer_ID'; // Column name for customer ID
    } else if (typeOfUser === 'supplier') {
      table = 'supplier';
      idField = 'Supplier_ID'; // Column name for supplier ID
    }
  
    const query = `SELECT first_name, last_Name, password, ${idField} FROM ${table} WHERE Email = ? And is_deleted = 0`;
    
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(401).send('Account not found');
  
      const user = results[0];
      
      if (user.password !== password) {
        return res.status(401).send('Invalid credentials');
      }
  
      res.json({
        success: true,
        user: {
          first_name: user.first_name,
          last_Name: user.last_Name,
          id: user[idField],
          type: table
        }
      });
    });
};

// exports.adminLogin = (req, res) => {
//   const {password, email} = req.body.formData;
//   console.log(password, email);

//   db.query(`SELECT name, last_Name, password, admin_ID FROM administrators WHERE email = ? And is_deleted = 0`, [email], (err, results) => {
//     if (err) return res.status(500).send(err);
//     console.log(results);
//     if (results.length === 0) return res.status(401).send('Account not found');

//     console.log(results);
//     const user = results[0];
//     console.log("password", user.password);
//     if (user.password !== password) {
//       return res.status(401).send('Invalid credentials');
//     }

//     res.json({
//       success: true,
//       user: {
//         name: user.name,
//         last_Name: user.last_Name,
//         admin_ID: user.admin_ID,
//       }
//     });
//   });

// }

exports.getUser = async (req, res) => {
  try {
    const { id, type } = req.params;
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