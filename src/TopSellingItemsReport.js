import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './supplier-page.css'; 

const TopSellingItemsReport = ({ supplierId, siteWide = false }) => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const apiUrl = window.APP_CONFIG.API_URL;

  useEffect(() => {
    fetchTopSellingItems();
  }, [supplierId, period, limit, siteWide]);

  const getDateRange = (periodType) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch(periodType) {
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'yearly':
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

  const fetchTopSellingItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(period);
      
      let endpoint;
      const params = {
        limit,
        startDate,
        endDate
      };
      
      
      if (!siteWide && supplierId) {
        endpoint = `${apiUrl}/api/supplier/${supplierId}/top-selling-items`;
      } else {
        endpoint = `${apiUrl}/api/top-selling-items`;
        
        if (!siteWide && supplierId) {
          params.supplierId = supplierId;
        }
      }
      
      const response = await axios.get(endpoint, { params });
      
      if (response.data.success) {
        setReportData(response.data.data.topItems);
      } else {
        throw new Error(response.data.error || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching top selling items:', err);
      setError(err.response?.data?.error || 'Failed to fetch top selling items report');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
  };

  return (
    <div className="top-items-report-container">
      <h2>{siteWide ? 'Site-Wide Top Selling Items' : 'Your Top Selling Items'}</h2>
      
      <div className="filter-controls">
        <div className="period-selector">
          <label htmlFor="periodSelectTop">Time Period:</label>
          <select 
            id="periodSelectTop" 
            value={period} 
            onChange={handlePeriodChange}
            className="period-select"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="limit-selector">
          <label htmlFor="limitSelect">Show top:</label>
          <select 
            id="limitSelect" 
            value={limit} 
            onChange={handleLimitChange}
            className="limit-select"
          >
            <option value="5">5 items</option>
            <option value="10">10 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading top selling items...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {reportData && reportData.length > 0 ? (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item Name</th>
                    <th>Supplier</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={item.Item_ID || index}>
                      <td>{index + 1}</td>
                      <td>{item.Name}</td>
                      <td>{item.Supplier_Name}</td>
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
    </div>
  );
};

export default TopSellingItemsReport;