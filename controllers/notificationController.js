const db = require('../config/db');

const getSupplierNotifications = (req, res) => {
  const supplierId = req.params.supplierId;
  
  db.query(
    'SELECT * FROM supplier_notification WHERE supplier_id = ? ORDER BY created_at DESC',
    [supplierId],
    (error, results) => {
      if (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Failed to fetch notifications' });
      }
      res.status(200).json(results);
    }
  );
};

// mark notification as read
const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  
  try {
    const query = `
      UPDATE supplier_notification 
      SET is_read = 1 
      WHERE notification_id = ?
    `;
    
    await db.query(query, [notificationId]);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};



module.exports = {
  getSupplierNotifications,
  markNotificationAsRead
};