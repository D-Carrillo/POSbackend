import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './supplier-page.css';

const DiscountReport = ({ supplierId }) => {
    const [period, setPeriod] = useState('Weekly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logOutput, setLogOutput] = useState([]);
    const apiUrl = window.APP_CONFIG.API_URL;
     const [d_summary, setDsummary] = useState({
        discountLoss: 0,
        totalDiscountedItems: 0,
        discountedSales: 0
      });

    useEffect(() => {
        fetchSalesReport();
    }, [supplierId, period]);

    const getDateRange = (periodType) => {
        const endDate = new Date();
        let startDate = new Date();

        switch (periodType) {
            case 'Weekly':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'Monthly':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'Yearly':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 7);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };
    const fetchSalesReport = async () => {
        if (!supplierId) {
            setError('Supplier ID not available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { startDate, endDate } = getDateRange(period);


            const response = await axios.get(`${apiUrl}/api/discount/${supplierId}`, {
                params: { startDate, endDate }
            });

            if (response.data.success) {
                setDsummary(response.data.data.d_summary);
                setLogOutput(response.data.data.logOutput);
            } else {
                throw new Error(response.data.error || 'Failed to fetch report');
            }
        } catch (err) {
            console.error('Error fetching discount report:', err);
            setError(err.response?.data?.error || 'Failed to fetch discount report');
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
    };

    return (
        <div className="sales-report-container">
            <h2>Discount Report</h2>

            <div className="period-selector">
                <label htmlFor="periodSelect">Select Period:</label>
                <select
                    id="periodSelect"
                    value={period}
                    onChange={handlePeriodChange}
                    className="period-select"
                >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading report data...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <div className="summary-metrics">
                        <div className="metric-card">
                            <h3>$ Lost to Discounts</h3>
                            <p className="metric-value">${Number(d_summary.discount_loss).toFixed(2) || "0.00"}</p>
                        </div>
                        <div className="metric-card">
                            <h3>Items on Discount</h3>
                            <p className="metric-value">{d_summary.items_with_discount || 0}</p>
                        </div>
                        <div className="metric-card">
                            <h3>Discounted Purchases</h3>
                            <p className="metric-value">{d_summary.discounted_sales || 0}</p>
                        </div>
                    </div>
                </>
            )}

            {logOutput && logOutput.length > 0 && (
                <div className="transaction-log-container">
                    <h3>Transaction Sale Log</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Discount Name</th>
                                <th>Item Name</th>
                                <th>Date</th>
                                <th>Original Price</th>
                                <th>Discounted Price</th>
                                <th>Money Lost</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logOutput.map((log, index) => (
                                <tr key={index}>
                                    <td>{log.transaction_id}</td>
                                    <td>{log.discount_name}</td>
                                    <td>{log.item_name}</td>
                                    <td>{new Date(log.sale_time).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</td>
                                    <td>${parseFloat(log.original_price).toFixed(2)}</td>
                                    <td>${parseFloat(log.discounted_price).toFixed(2)}</td>
                                    <td>${parseFloat(log.money_lost).toFixed(2)}</td>
                                    <td>{log.item_quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DiscountReport;