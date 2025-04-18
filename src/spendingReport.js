import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './Report.css';

Chart.register(...registerables);

const SpendingReport = ({ userId }) => {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (period !== 'custom') {
      const now = new Date();
      let start = new Date();
      
      switch (period) {
        case 'day':
          start.setDate(now.getDate() - 1);
          break;
        case 'week':
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          start.setFullYear(now.getFullYear() - 1);
          break;
        default:
          start.setMonth(now.getMonth() - 1);
      }
      
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
      
    try {
      const response = await axios.get(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/spending/${userId}`, {
        params: { 
          period,
          startDate: period === 'custom' ? startDate : undefined,
          endDate: period === 'custom' ? endDate : undefined
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('API Response:', response.data);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load spending report');
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [period, startDate, endDate]);

  if (loading) return <div className="spending-loading">Loading report...</div>;
  if (error) return <div className="spending-error">Error: {error}</div>;

  return (
    <div className="spending-report-container">
      <div className="spending-controls-container">
        <label className="spending-control-label">
          Time Period:
          <select 
            className="spending-period-select"
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </label>
        
        {period === 'custom' && (
          <div className="spending-date-range">
            <label className="spending-control-label">
              Start:
              <input 
                className="spending-date-input"
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                max={endDate || new Date().toISOString().split('T')[0]}
              />
            </label>
            <label className="spending-control-label">
              End:
              <input 
                className="spending-date-input"
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </label>
          </div>
        )}
        
        <button 
          className="spending-refresh-button"
          onClick={fetchData} 
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Refresh Report'}
        </button>
      </div>
      
      {reportData && (
        <>
          <div className="spending-summary-cards">
            <div className="spending-summary-card">
              <h3 className="spending-card-title">Total Spent</h3>
              <p className="spending-card-value">${Number(reportData.total_spent).toFixed(2)}</p>
            </div>
            <div className="spending-summary-card">
              <h3 className="spending-card-title">Transactions</h3>
              <p className="spending-card-value">{reportData.transaction_count}</p>
            </div>
            <div className="spending-summary-card">
              <h3 className="spending-card-title">Items Purchased</h3>
              <p className="spending-card-value">{reportData.total_items}</p>
            </div>
            <div className="spending-summary-card">
              <h3 className="spending-card-title">Avg. Order Value</h3>
              <p className="spending-card-value">${Number(reportData.average_order_value).toFixed(2)}</p>
            </div>
          </div>
          
          <div className="spending-chart-row">
            <div className="spending-chart-container">
              <Line 
                data={{
                  labels: reportData.spending_trend.map(item => item.period),
                  datasets: [{
                    label: 'Spending ($)',
                    data: reportData.spending_trend.map(item => item.total_spent),
                    backgroundColor: '#2962ff',
                    borderColor: '#2962ff',
                    borderWidth: 2,
                    tension: 0.1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Your Spending Trend'
                    }
                  }
                }}
              />
            </div>
            <div className="spending-chart-container">
              <Pie 
                data={{
                  labels: reportData.category_breakdown.map(item => item.category_name),
                  datasets: [{
                    data: reportData.category_breakdown.map(item => item.total_spent),
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 206, 86, 0.7)',
                      'rgba(75, 192, 192, 0.7)',
                      'rgba(153, 102, 255, 0.7)',
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Spending by Category'
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <h3 className="spending-detail-title">Detailed Transactions</h3>
          <table className="spending-detail-table">
            <thead>
              <tr>
                <th className="spending-table-header">Period</th>
                <th className="spending-table-header">Transactions</th>
                <th className="spending-table-header">Total Spent</th>
                <th className="spending-table-header">Items</th>
                <th className="spending-table-header">Avg. Order</th>
              </tr>
            </thead>
            <tbody>
              {reportData.spending_trend.map((item, index) => (
                <tr key={index} className="spending-table-row">
                  <td className="spending-table-cell">{item.period}</td>
                  <td className="spending-table-cell">{item.transaction_count}</td>
                  <td className="spending-table-cell">${Number(item.total_spent).toFixed(2)}</td>
                  <td className="spending-table-cell">{item.total_items_sold}</td>
                  <td className="spending-table-cell">${Number(item.average_order_value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default SpendingReport;