const db = require('../config/db');

const getSupplierSalesSummary = async (supplierId, startDate, endDate) => {
  try {
    console.log("Model: Getting supplier sales summary:", { supplierId, startDate, endDate });
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); 
    
    const query = `
      SELECT 
        i.Item_ID,
        i.Name,
        SUM(ti.Quantity) AS total_units_sold,
        SUM(ti.Subtotal) AS total_revenue
      FROM 
        item i
      JOIN 
        transaction_item ti ON i.Item_ID = ti.Item_ID
      JOIN 
        transaction t ON ti.Transaction_ID = t.Transaction_ID
      WHERE 
        i.supplier_ID = ? 
        AND t.sale_time BETWEEN ? AND ?
        AND t.Transaction_Status = 1
      GROUP BY 
        i.Item_ID, i.Name
      ORDER BY 
        total_units_sold DESC`;
    
    const [results] = await db.promise().query(query, [supplierId, startDateObj, endDateObj]);
    console.log(`Found ${results.length} items in sales summary`);
    return results;
  } catch (error) {
    console.error("Error in getSupplierSalesSummary model:", error);
    throw error;
  }
};

const getTopSellingItems = async (limit, supplierId = null, startDate = null, endDate = null) => {
  try {
    console.log("Model: Getting top selling items:", { limit, supplierId, startDate, endDate });
    
    let query = `
      SELECT 
        i.Item_ID,
        i.Name,
        i.supplier_ID,
        s.Company_Name as Supplier_Name,
        SUM(ti.Quantity) AS total_units_sold,
        SUM(ti.Subtotal) AS total_revenue
      FROM 
        item i
      JOIN 
        transaction_item ti ON i.Item_ID = ti.Item_ID
      JOIN 
        transaction t ON ti.Transaction_ID = t.Transaction_ID
      JOIN
        supplier s ON i.supplier_ID = s.Supplier_ID
      WHERE 
        t.Transaction_Status = 1 `;
    
    const params = [];
    
    if (supplierId) {
      query += ` AND i.supplier_ID = ? `;
      params.push(supplierId);
    }
    
    if (startDate && endDate) {
      query += ` AND t.sale_time BETWEEN ? AND ? `;
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); 
      params.push(startDateObj, endDateObj);
    }
    
    query += `
      GROUP BY 
        i.Item_ID, i.Name, i.supplier_ID, s.Company_Name
      ORDER BY 
        total_units_sold DESC
      LIMIT ?`;
    
    params.push(parseInt(limit));
    
    const [results] = await db.promise().query(query, params);
    console.log(`Found ${results.length} top selling items`);
    return results;
  } catch (error) {
    console.error("Error in getTopSellingItems model:", error);
    throw error;
  }
};

module.exports = {
  getSupplierSalesSummary,
  getTopSellingItems
};