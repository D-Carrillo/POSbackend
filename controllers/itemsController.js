const Item = require('../models/Item');
const db = require('../config/db');

const getAllItems = (req, res) => {
    Item.getAll((err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({error: 'Failed to fetch products'});
        }
        console.log('Raw database results: ', results);
        res.json(results);
    });
};

const itemEntry = (req, res) => {
    Item.findItem(req.body.itemName, (err, results) => {
        if (err) return res.status(500).json({error: 'Database error'});
        if (results.length > 0) return res.status(409).send('item already exist ');

        Item.create(req.body, (err, results) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.status(500).send('Error inserting data');
            }

            return res.status(201).json({
                success: true,
                itemId: results.insertId
            });
        });

    });
}

const getSupplierItems = async (req, res) => {
    const supplierId = req.params.supplierId;

    // Validate supplierId
    if (!supplierId || isNaN(supplierId)) {
        return res.status(400).json({ error: 'Invalid supplier ID' });
    }

    try {
        const query = `
            SELECT
                item_id,
                Name,
                description,
                price,
                stock_quantity as quantity,
                reorder_Threshold
            FROM Item
            WHERE supplier_id = ? and is_deleted = false;
        `;

        const [items] = await db.promise().query(query, [supplierId]);

        res.status(200).json(items);

    } catch (err) {
        console.error('Error fetching supplier items:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};

const itemdelete = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        await db.promise().query(
            `Update item set is_deleted = true where item_Id = ?`, [itemId]
        );
        res.status(200).json({ success: true });

    }catch (err){
        console.error('Delete error', err);
        res.status(500).json({ error: 'Delete failed'})
    };
}

const modify = async (req, res) => {
    try {
        const { Name, description, price, quantity } = req.body;
        await db.promise().query(
          `UPDATE Item
           SET Name = ?, description = ?, price = ?, stock_quantity = ?
           WHERE item_id = ?`,
          [Name, description, price, quantity, req.params.itemId]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

const updateStock = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { quantity } = req.body;

        // First get current stock
        const [rows] = await db.promise().query(
          'SELECT stock_quantity FROM item WHERE Item_ID = ?',
          [itemId]
        );

        if (rows.length === 0) {
          return res.status(404).json({ error: 'Item not found' });
        }

        const newQuantity = rows[0].stock_quantity - quantity;

        if (newQuantity < 0) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }

        await db.promise().query(
          'UPDATE item SET stock_quantity = ? WHERE Item_ID = ?',
          [newQuantity, itemId]
        );

        res.status(200).json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Stock update failed' });
      }
};

const searchItems = async (req, res) => {
    const { query } = req.query;

    try {
        const [results] = await db.promise().query(
            `SELECT I.Item_ID, I.Name, I.Price AS price, I.description, I.stock_quantity, I.image_url, C.Category_name FROM item AS I JOIN Category as C ON I.Category_ID = C.Category_ID WHERE I.is_deleted = 0 AND I.stock_quantity AND I.Name LIKE ?`,
            [`%${query}%`]
        );

        res.status(200).json(results);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Failed to search items' });
    }
};
module.exports = {
    getAllItems,
    itemEntry,
    getSupplierItems,
    itemdelete,
    modify,
    updateStock,
    searchItems,
};

