const db = require('../config/db');

const createTransaction = async (req, res) => {
    try {
        const { customer_id, total_cost, payment_method, total_items, transaction_status, total_discount } = req.body;
        
        const [result] = await db.promise().query(
          `INSERT INTO transaction 
           (Customer_ID, sale_time, Total_cost, Payment_method, Total_items, Transaction_Status, Total_Discount)
           VALUES (?, NOW(), ?, ?, ?, ?, ?)`,
          [customer_id, total_cost, payment_method, total_items, transaction_status, total_discount]
        );
    
        res.status(201).json({ 
          success: true,
          transactionId: result.insertId
        });
      } catch (err) {
        res.status(500).json({ error: 'Transaction creation failed' });
      }
};

const createTransactionItem = async (req, res) => {
    try {
        const { transaction_id, item_id, quantity, subtotal, discount_id, discounted_price } = req.body;

        const discountID = discount_id === null || discount_id === undefined ? null : Number(discount_id);

        // Log the variables to debug
        console.log("Transaction Details:", {
            transaction_id, item_id, quantity, subtotal, discountID, discounted_price
        });
        
        await db.promise().query(
          `INSERT INTO transaction_item 
           (Transaction_ID, Item_ID, Quantity, Subtotal, Discount_ID, Discounted_Price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [Number(transaction_id), Number(item_id), Number(quantity), parseFloat(subtotal), discountID, parseFloat(discounted_price)]
        );
    
        res.status(201).json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Transaction item creation failed' });
      }
};
const getUserTransactions = async (req, res) => {
  try {
      const [transactions] = await db.promise().query(`
          SELECT * from transaction
          WHERE Customer_ID = ?
          Order BY sale_time DESC
      `, [req.params.userId]);

      let items = [];
      if (transactions.length > 0) {
          const transactionIds = transactions.map(t => t.Transaction_ID);
          const placeholders = transactionIds.map(() => '?').join(',');

          const [itemsResults] = await db.promise().query(`
              SELECT 
                  ti.Transaction_ID,
                  ti.Item_ID,
                  ti.Quantity,
                  ti.Subtotal,
                  ti.Discounted_Price,
                  i.Name AS item_name,
                  i.description AS item_description,
                  i.Price AS item_price
              FROM transaction_item ti
              JOIN item i ON ti.Item_ID = i.Item_ID
              WHERE ti.Transaction_ID IN (${placeholders})
              ORDER BY ti.Transaction_ID DESC
          `, transactionIds);

          items = itemsResults;
      }

      let transactionItems = [];
      if (transactions.length > 0) {
          const transactionIds = transactions.map(t => t.Transaction_ID);
          const placeholders = transactionIds.map(() => '?').join(',');

          const [transactionItemsResults] = await db.promise().query(`
              SELECT 
                  ti.TransactionItem_id,
                  ti.Transaction_ID,
                  ti.Item_ID,
                  ti.Quantity,
                  ti.Subtotal,
                  ti.Discount_ID,
                  ti.Discounted_Price,
                  i.Name AS item_name,
                  i.Description AS item_description,
                  i.Price AS item_price
              FROM transaction_item ti
              JOIN item i ON ti.Item_ID = i.Item_ID
              WHERE ti.Transaction_ID IN (${placeholders})
              ORDER BY ti.Transaction_ID DESC
          `, transactionIds);

          transactionItems = transactionItemsResults;
      }

      console.log(transactionItems);

      res.json({
          success: true,
          transactions: transactions,
          items: items,
          transactionItems: transactionItems
      });
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ 
          success: false,
          error: 'Failed to fetch transactions',
          details: {
              message: err.message,
              sql: err.sql,
              stack: err.stack
          }
      });
  }
};



const returnItem = async (req, res) => {
  const { transaction_id, item_id, return_reason } = req.body;

  try {
    const[[item]] = await db.promise().query(`
      Select Quantity, Discounted_Price, Subtotal 
      From transaction_item
      where Transaction_ID = ? and Item_ID = ?`,
    [transaction_id, item_id]);

    if (!item) {
      throw new Error('Item not found in transaction');
    }
    
    const refund_amount = item.Discounted_Price !== null 
      ? item.Discounted_Price 
      : item.Subtotal;
  
    await db.promise().query(`
      INSERT INTO return_item (Transaction_ID, Item_ID, return_reason, refund_amount, return_date)
      VALUES (?, ?, ?, ?, CURDATE())`, 
      [transaction_id, item_id, return_reason, refund_amount]
    );
    
    res.json({
      success: true,
      refund_amount: Number(refund_amount).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({
      success: false, error: 'Return failed'
    });
  };
}

const getreturnItem = async (req, res) => {

    try {
      const[returnItems] = await db.promise().query(`
       Select Transaction_ID, Item_ID from return_item` ,
      );


      res.json({
        success: true,
        return: returnItems
      });
    }catch (err){
      res.status(500).json({
        success: false, error: 'Return failed'
      });
  };
}

const acceptReturn = async (req, res) => {
  const { notification_id } = req.body;
  
  try {
    await db.promise().query('CALL accept_return(?)', [notification_id]);
    await db.promise().query(
      'UPDATE supplier_notification SET status = "accepted" WHERE notification_id = ?',
      [notification_id]
    );
    
    res.json({
      success: true,
      message: 'Return accepted successfully'
    });
  } catch (err) {
    console.error('Accept return error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to accept return'
    });
  }
};

const declineReturn = async (req, res) => {
  const { notification_id } = req.body;
  
  try {
    await db.promise().query('CALL decline_return(?)', [notification_id]);
    await db.promise().query(
      'UPDATE supplier_notification SET status = "declined" WHERE notification_id = ?',
      [notification_id]
    );
    await db.promise().query(`Update transaction set Transaction_status = 3 where Transaction_ID = (
      Select Transaction_ID
      from supplier_notification
      where notification_id = ?) `, [notification_id]);

      await db.promise().query(`
        DELETE FROM return_item 
        WHERE Item_ID = (
          SELECT Item_ID 
          FROM supplier_notification 
          WHERE notification_id = ?
        ) 
        AND Transaction_ID = (
          SELECT Transaction_ID 
          FROM supplier_notification 
          WHERE notification_id = ?
        )
      `, [notification_id, notification_id]);
      
    
    res.json({
      success: true,
      message: 'Return declined successfully'
    });
  } catch (err) {
    console.error('Decline return error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to decline return'
    });
  }
};


module.exports = {
    createTransaction,
    createTransactionItem,
    getUserTransactions,
    returnItem,
    getreturnItem,
    acceptReturn,
    declineReturn
}