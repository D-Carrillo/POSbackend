const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/customers', (req, res, next) => {
    console.log('Attempting to fetch customers...'); 

    const query = `
        SELECT
            Customer_ID,
            first_name,
            last_Name,
            Email,
            DOB,
            Phone_Number,
            is_deleted
        FROM customer
        ORDER BY last_Name, first_name`;

    db.query(query, (err, customers) => {
        if (err) {
            console.error('Database error details:', {
                message: err.message,
                sqlMessage: err.sqlMessage,
                code: err.code,
                sqlState: err.sqlState,
                sql: err.sql
            });
            return next(err);
        }

        res.json({
            success: true,
            data: customers
        });
    });
});

router.put(`/customers/:id/delete`, (req, res, next) => {
    const customerId = req.params.id;
    
    const query = `
        UPDATE customer
        SET is_deleted = 1
        WHERE Customer_ID = ?`;
    
    db.query(query, [customerId], (err, result) => {
        if (err) {
            console.error('Database error details:', {
                message: err.message,
                sqlMessage: err.sqlMessage,
                code: err.code,
                sqlState: err.sqlState,
                sql: err.sql
            });
            return next(err);
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    });
});

router.put(`/customers/:id/restore`, (req, res, next) => {
    const customerId = req.params.id;
    
    const query = `
        UPDATE customer
        SET is_deleted = 0
        WHERE Customer_ID = ?`;
    
    db.query(query, [customerId], (err, result) => {
        if (err) {
            console.error('Database error details:', {
                message: err.message,
                sqlMessage: err.sqlMessage,
                code: err.code,
                sqlState: err.sqlState,
                sql: err.sql
            });
            return next(err);
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Customer restored successfully'
        });
    });
});

router.get(`/products`, async (req, res, next) => {
    try {
        const itemQuery = `
            SELECT s.supplier_id, s.company_name, i.name, i.stock_quantity, i.Price, i.is_deleted
            FROM supplier AS s
            JOIN item AS i ON s.supplier_id = i.supplier_id
        `;

        const [results] = await db.promise().query(itemQuery);

        res.json({
            success: true,
            data: results
        });

    } catch (err) {
        console.error('Error fetching items:', err);
        next(err);
    }
});

router.put(`/products/delete`, async (req, res, next) => {
    try {
        const { supplierId, productName } = req.body;
        
        if (!supplierId || !productName) {
            return res.status(400).json({
                success: false,
                message: 'Supplier ID and product name are required'
            });
        }
        
        const query = `
            UPDATE item
            SET is_deleted = 1
            WHERE supplier_id = ? AND name = ?`;
        
        const [result] = await db.promise().query(query, [supplierId, productName]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (err) {
        console.error('Database error details:', {
            message: err.message,
            sqlMessage: err.sqlMessage,
            code: err.code,
            sqlState: err.sqlState
        });
        next(err);
    }
});
router.put(`/products/restore`, async (req, res, next) => {
    try {
        const { supplierId, productName } = req.body;
        
        if (!supplierId || !productName) {
            return res.status(400).json({
                success: false,
                message: 'Supplier ID and product name are required'
            });
        }
        
        const query = `
            UPDATE item
            SET is_deleted = 0
            WHERE supplier_id = ? AND name = ?`;
        
        const [result] = await db.promise().query(query, [supplierId, productName]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product restored successfully'
        });
    } catch (err) {
        console.error('Database error details:', {
            message: err.message,
            sqlMessage: err.sqlMessage,
            code: err.code,
            sqlState: err.sqlState
        });
        next(err);
    }
});
router.put(`/suppliers/:id/restore`, async (req, res, next) => {
    try {
        const supplierId = req.params.id;
        
        const query = `
            UPDATE supplier
            SET is_deleted = 0
            WHERE supplier_id = ?`;
        
        const [result] = await db.promise().query(query, [supplierId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Supplier restored successfully'
        });
    } catch (err) {
        console.error('Database error details:', {
            message: err.message,
            sqlMessage: err.sqlMessage,
            code: err.code,
            sqlState: err.sqlState
        });
        next(err);
    }
});

module.exports = router;