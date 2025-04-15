const db = require('../config/db');
const { subDays } = require('date-fns');

exports.getCustomerReports = async (req, res) => {
    const { period, customerId } = req.params;

    if (!customerId || !period) {
        return res.status(400).json({ error: 'Missing customer ID or period' });
    }

    let dateFormat, dateCondition;
    const now = new Date();

    switch (period) {
        case 'Weekly':
            dateFormat = '%Y-%u';
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            dateCondition = `t.sale_time >= '${oneWeekAgo.toISOString().slice(0, 19).replace('T', ' ')}'`;
            break;

        case 'Monthly':
            dateFormat = '%Y-%m';
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            dateCondition = `t.sale_time >= '${oneMonthAgo.toISOString().slice(0, 19).replace('T', ' ')}'`;
            break;

        case 'Yearly':
            dateFormat = '%Y';
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            dateCondition = `t.sale_time >= '${oneYearAgo.toISOString().slice(0, 19).replace('T', ' ')}'`;
            break;

        default:
            return res.status(400).json({ error: 'Invalid period' });
    }

    const query = `
        SELECT
            DATE_FORMAT(t.sale_time, ?) AS period,
            SUM(t.Total_cost) AS total_spent,
            COUNT(t.Transaction_ID) AS transaction_count,
            SUM(t.Total_items) AS total_items_purchased,
            AVG(t.Total_cost) AS average_order_value
        FROM transaction AS t
        WHERE t.Customer_ID = ?
        AND ${dateCondition}
        AND t.Transaction_Status = 1
        GROUP BY period
        ORDER BY period DESC
    `;

    try {
        const [results] = await db.promise().query(query, [dateFormat, customerId]);
        console.log('Customer Reports Results:', results);
        res.json(results);
    } catch (err) {
        console.error('Report error:', err);
        return res.status(500).json({ error: 'Failed to generate report', details: err.message });
    }
};

exports.getSupplierReport = async (req, res) => {
    const { supplierId } = req.params;
    const { period, itemId } = req.query;

    if (!supplierId) {
        return res.status(400).json({ error: 'Supplier ID is required' });
    }

    let dateCondition = '';
    let queryParams = [supplierId];

    if (period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'Weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'Monthly':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'Yearly':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                return res.status(400).json({ error: 'Invalid period specified' });
        }

        dateCondition = `AND t.sale_time >= ?`;
        queryParams.push(startDate);
    }

    const itemCondition = itemId ? `AND i.Item_ID = ?` : '';
    if (itemId) queryParams.push(itemId);

    const query = `
        SELECT
            i.Item_ID,
            i.Name AS item_name,
            COUNT(t.Transaction_ID) AS times_sold,
            SUM(ti.Quantity) AS total_quantity,
            SUM(ti.Subtotal) AS total_revenue
        FROM transaction_item AS ti
        JOIN transaction t ON ti.Transaction_ID = t.Transaction_ID
        JOIN item AS i ON ti.Item_ID = i.Item_ID
        WHERE i.supplier_ID = ?
        ${itemCondition}
        ${dateCondition}
        AND t.Transaction_Status = 1
        GROUP BY i.Item_ID
        ORDER BY total_revenue DESC
    `;

    try {
        const [results] = await db.promise().query(query, queryParams);
        console.log('Supplier Report Results:', results);
        res.json(results);
    } catch (err) {
        console.error('Supplier report error:', err);
        res.status(500).json({ error: 'Failed to generate supplier report', details: err.message });
    }
};

exports.getSpendingReport = async (req, res) => {
    const { userID } = req.params;
    const { period, startDate, endDate } = req.query;

    console.log("Generating spending report for:", { userID, period, startDate, endDate });

    const now = new Date();
    let dateFilter = {};

    if (period === 'custom' && startDate && endDate) {
        dateFilter = {
            gte: new Date(`${startDate}T00:00:00.000Z`),
            lte: new Date(`${endDate}T23:59:59.999Z`)
        };
    } else if (period === 'day') {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        dateFilter = {
            gte: startOfDay,
            lte: endOfDay
        };
    } else if (period === 'week') {
        const startOfWeek = subDays(now, 6);
        startOfWeek.setHours(0, 0, 0, 0);

        dateFilter = {
            gte: startOfWeek,
            lte: now
        };
    } else if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
            gte: startOfMonth,
            lte: now
        };
    } else if (period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = {
            gte: startOfYear,
            lte: now
        };
    } else {
        dateFilter = {
            gte: subDays(now, 30),
            lte: now
        };
    }

    console.log("Date range:", {
        start: dateFilter.gte.toISOString(),
        end: dateFilter.lte.toISOString()
    });

    try {
        const [trend] = await db.promise().query(
            `SELECT
                ANY_VALUE(CASE
                    WHEN ? = 'day' THEN DATE_FORMAT(t.sale_time, '%H:00')
                    WHEN ? = 'week' THEN DATE_FORMAT(t.sale_time, '%Y-%m-%d')
                    WHEN ? = 'month' THEN DATE_FORMAT(t.sale_time, '%Y-%m-%d')
                    WHEN ? = 'year' THEN DATE_FORMAT(t.sale_time, '%Y-%m')
                    ELSE DATE_FORMAT(t.sale_time, '%Y-%m-%d')
                END) AS period,
                COUNT(t.Transaction_ID) AS transaction_count,
                SUM(COALESCE(t.Total_cost, 0)) AS total_spent,
                SUM(COALESCE(t.Total_items, 0)) AS total_items_sold,
                AVG(COALESCE(t.Total_cost, 0)) AS average_order_value
            FROM transaction t
            WHERE t.Customer_ID = ?
            AND t.sale_time BETWEEN ? AND ?
            AND t.Transaction_Status = 1
            GROUP BY
                CASE
                    WHEN ? = 'day' THEN DATE_FORMAT(t.sale_time, '%H')
                    WHEN ? = 'week' THEN DATE_FORMAT(t.sale_time, '%Y-%m-%d')
                    WHEN ? = 'month' THEN DATE_FORMAT(t.sale_time, '%Y-%m-%d')
                    WHEN ? = 'year' THEN DATE_FORMAT(t.sale_time, '%Y-%m')
                    ELSE DATE_FORMAT(t.sale_time, '%Y-%m-%d')
                END
            ORDER BY MIN(t.sale_time)`,
            [ period, period, period, period, userID, dateFilter.gte, dateFilter.lte, period, period, period, period ] );

        const [categories] = await db.promise().query(`
            SELECT
                c.Category_Name AS category_name,
                SUM(COALESCE(ti.Subtotal, 0)) AS total_spent
            FROM transaction t
            JOIN transaction_item ti ON t.Transaction_ID = ti.Transaction_ID
            JOIN item i ON ti.Item_ID = i.Item_ID
            JOIN category c ON i.Category_ID = c.Category_ID
            WHERE t.Customer_ID = ?
            AND t.Transaction_Status = 1
            AND t.sale_time BETWEEN ? AND ?
            GROUP BY c.Category_Name
        `, [userID, dateFilter.gte, dateFilter.lte]);

        console.log("Found spending trend records:", trend.length);
        console.log("Found category records:", categories.length);

        const total_spent = trend.reduce((sum, row) => sum + parseFloat(row.total_spent || 0), 0);
        const total_items = trend.reduce((sum, row) => sum + parseInt(row.total_items_sold || 0), 0);
        const transaction_count = trend.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0);
        const average_order_value = transaction_count > 0 ? total_spent / transaction_count : 0;

        console.log("Summary:", {
            total_spent,
            total_items,
            transaction_count,
            average_order_value,
        });

        res.json({
            total_spent,
            total_items,
            transaction_count,
            average_order_value,
            spending_trend: trend,
            category_breakdown: categories,
        });
    } catch (err) {
        console.error('Spending report error:', err);
        res.status(500).json({ error: 'Failed to generate spending report', details: err.message });
    }
};

exports.getSupplierSalesSummary = async (req, res) => {
    try {
        const supplierId = req.params.supplierId;
        const { startDate, endDate } = req.query;

        console.log("Generating supplier sales summary:", { supplierId, startDate, endDate });

        if (!supplierId) {
            return res.status(400).json({ error: 'Supplier ID is required' });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

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

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);

        console.log("Query date range:", {
            start: startDateObj.toISOString(),
            end: endDateObj.toISOString()
        });

        const [results] = await db.promise().query(query, [
            supplierId,
            startDateObj,
            endDateObj
        ]);

        console.log("Found sales summary records:", results.length);

        const logQuery = `
        SELECT
            t.Transaction_ID,
            t.sale_time AS transaction_date,
            i.Name AS item_name,
            i.Price AS Price,
            c.Email AS Email,
            ti.Quantity
        FROM
            transaction t
        JOIN
            transaction_item ti ON t.Transaction_ID = ti.Transaction_ID
        JOIN
            item i ON ti.Item_ID = i.Item_ID
        JOIN
            customer c ON c.Customer_ID = t.Customer_ID
        WHERE
            i.supplier_ID = ?
            AND t.sale_time BETWEEN ? AND ?
            AND t.Transaction_Status = 1
        ORDER BY
            t.Transaction_ID, t.sale_time
        `;

        const [logResults] = await db.promise().query(logQuery, [
            supplierId,
            startDateObj,
            endDateObj
        ]);

        const totalUnitsSold = results.reduce((sum, item) => sum + Number(item.total_units_sold), 0);
        const totalRevenue = results.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);

        res.status(200).json({
            success: true,
            data: {
                salesSummary: results,
                summary: {
                    totalItems: results.length,
                    totalUnitsSold,
                    totalRevenue
                },
                period: {
                    startDate,
                    endDate
                },
                logOutput: logResults
            }
        });
    } catch (error) {
        console.error('Error generating supplier sales summary:', error);
        res.status(500).json({ error: 'Failed to generate sales summary report', details: error.message });
    }
};



exports.getTopSellingItems = async (req, res) => {
    try {
        const { limit = 10, supplierId, startDate, endDate } = req.query;

        console.log("Generating top selling items report:", { limit, supplierId, startDate, endDate });

        const numLimit = parseInt(limit);
        if (isNaN(numLimit) || numLimit <= 0) {
            return res.status(400).json({ error: 'Limit must be a positive number' });
        }

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

            console.log("Query date range:", {
                start: startDateObj.toISOString(),
                end: endDateObj.toISOString()
            });
        }

        query += `
            GROUP BY
                i.Item_ID, i.Name, i.supplier_ID, s.Company_Name
            ORDER BY
                total_units_sold DESC
            LIMIT ?`;

        params.push(numLimit);

        const [results] = await db.promise().query(query, params);

        console.log("Found top selling items:", results.length);

        const responseData = {
            success: true,
            data: {
                topItems: results,
                count: results.length
            }
        };

        if (supplierId) {
            responseData.data.filteredBySupplier = true;
        }

        if (startDate && endDate) {
            responseData.data.period = {
                startDate,
                endDate
            };
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error generating top selling items report:', error);
        res.status(500).json({ error: 'Failed to generate top selling items report', details: error.message });
    }
};