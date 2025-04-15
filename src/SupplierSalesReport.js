import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './supplier-page.css';

const SupplierSalesReport = ({ supplierId }) => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState('Weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logOutput, setLogOutput] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalUnitsSold: 0,
    totalRevenue: 0
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


      const response = await axios.get(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/supplier-sales/${supplierId}`, {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        setReportData(response.data.data.salesSummary);
        setSummary(response.data.data.summary);
        setLogOutput(response.data.data.logOutput);
      } else {
        throw new Error(response.data.error || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching supplier sales report:', err);
      setError(err.response?.data?.error || 'Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="sales-report-container">
      <h2>Sales Summary Report</h2>

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
              <h3>Total Revenue</h3>
              <p className="metric-value">${summary.totalRevenue?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="metric-card">
              <h3>Total Units Sold</h3>
              <p className="metric-value">{summary.totalUnitsSold || 0}</p>
            </div>
            <div className="metric-card">
              <h3>Unique Products</h3>
              <p className="metric-value">{summary.totalItems || 0}</p>
            </div>
          </div>

          {reportData && reportData.length > 0 ? (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Total Units Sold</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={item.Item_ID || index}>
                      <td>{item.Name}</td>
                      <td>{item.total_units_sold}</td>
                      <td>${parseFloat(item.total_revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-message">
              No sales data available for the selected period.
            </div>
          )}
        </>
      )}

      {logOutput && logOutput.length > 0 && (
        <div className="transaction-log-container">
          <h3>Transaction Sale Log</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User Email</th>
                <th>Date</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {logOutput.map((log, index) => (
                <tr key={index}>
                  <td>{log.Transaction_ID}</td>
                  <td>{log.Email}</td>
                  <td>{new Date(log.transaction_date).toLocaleString()}</td>
                  <td>{log.item_name}</td>
                  <td>${parseFloat(log.Price).toFixed(2)}</td>
                  <td>{log.Quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplierSalesReport;