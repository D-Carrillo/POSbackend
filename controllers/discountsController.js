const db = require('../config/db');

const addDiscount = async (req, res) => {
    try {
        const {name, value, type, startDate, endDate, itemId, is_deleted } = req.body;

        await db.promise().query(
            `Insert Into discount
            (Name, Discount_Value, Start_Date, End_Date, Item_ID, Discount_type, is_deleted)
            values (?,?,?,?,?,?,?)`, 
            [name, parseFloat(value), startDate, endDate, Number(itemId), Number(type), Number(is_deleted)]
        )
        res.status(201).json({success: true,});
    }catch (err) {
        res.status(500).json({error: 'Discount creation failed'});
    };
};

const getDiscount = async (req, res) => {
    const supplierID = req.params.supplierID;
    if (!supplierID) {
        return res.status(400).json({error: 'Supplier ID is required'});
    }
    try {

        const [discounts] = await db.promise().query(
            `SELECT d.Name, d.Discount_Value as value, d.Start_Date, d.End_Date, d.Discount_type as type, Discount_ID as discount_id, d.Item_ID as item_id
            FROM item as i, discount as d 
            where i.supplier_ID = ? and i.item_id = d.item_id and d.is_deleted = 0
            order by d.End_date`, [supplierID]
        );

        if (discounts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(discounts);
    }catch (err) {
        console.error('Error fetching discounts:', err);
        res.status(500).json({error: 'Internal Server error'});
    };
};

const deleteDiscount = async (req, res) => {
    const discountID = req.params.discountID;
    
    try {
        await db.promise().query(
            `Update discount set is_deleted = 1 where Discount_ID = ?`, [discountID]
        );

        res.status(200).json({ success: true})
    }catch (err) {
        console.error('Error deleting discounts:', err);
        res.status(500).json({error: 'Internal Server error'});
    };
}

const getCodes = async (req,res) => {
    const code = req.params.code;

    try {
        const discount = await db.promise().query(
            `Select Discount_ID, Name, Discount_Value as value, Start_date, end_date, Item_ID, Discount_type as type from discount where Name = ? and is_deleted = 0`, [code]
        );

        res.status(200).json(discount)
        
    }catch (err) {
        console.error('Error getting the discount codes', err);
        res.status(500).json({error: 'Internal Server error'});
    }
}

module.exports = {
    addDiscount,
    getDiscount,
    deleteDiscount,
    getCodes
}