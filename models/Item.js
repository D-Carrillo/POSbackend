const db = require('../config/db');

class Item {
    static getAll(callback) {
        db.query('SELECT I.Item_ID, I.Name, I.price, I.description, I.stock_quantity, C.Category_name, I.image_url From Item AS I, Category as C Where I.category_ID = C.Category_ID and I.is_deleted = 0 and I.stock_quantity > 0', (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    static findItem(itemName, callback) {
        db.query(`Select Name From item Where name = ?`, [itemName], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    static create(itemData, callback) {
        const { itemName, itemDescription, price, quantity, reorderThreshold, id, category, imageURL } = itemData;

        db.query(
          'INSERT INTO item SET ?',
          {
            Name: itemName,
            description: itemDescription,
            Price: price,
            stock_quantity: quantity,
            reorder_Threshold: reorderThreshold,
            supplier_ID: id,
            category_ID: category,
            image_url: imageURL
          },
          callback
        );
    }

}

module.exports = Item;