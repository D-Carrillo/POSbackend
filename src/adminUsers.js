import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './adminUsers.css';
const apiUrl = window.APP_CONFIG.API_URL;

const AdminUsers = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/customers`);
      if (response.data.success) {
        setCustomers(response.data.data);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await axios.put(`${apiUrl}/api/admin/customers/${customerId}/delete`);
        if (response.data.success) {
          // Refresh the customer list
          fetchCustomers();
        } else {
          setError('Failed to delete customer');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete customer');
      }
    }
  };

  const handleRestoreCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to restore this customer?')) {
      try {
        const response = await axios.put(`${apiUrl}/api/admin/customers/${customerId}/restore`);
        if (response.data.success) {
          // Refresh the customer list
          fetchCustomers();
        } else {
          setError('Failed to restore customer');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to restore customer');
      }
    }
  };

  if (!user || !user.is_admin) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-users-container">
      <h1>Customer Management</h1>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Date of Birth</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.Customer_ID} className={customer.is_deleted ? "deleted-row" : ""}>
                <td>{customer.first_name}</td>
                <td>{customer.last_Name}</td>
                <td>{customer.Email}</td>
                <td>{customer.DOB ? new Date(customer.DOB).toLocaleDateString() : 'N/A'}</td>
                <td>{customer.Phone_Number || 'N/A'}</td>
                <td>{customer.is_deleted ? 'Inactive' : 'Active'}</td>
                <td>
                  {!customer.is_deleted ? (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteCustomer(customer.Customer_ID)}
                    >
                      Delete
                    </button>
                  ) : (
                    <button 
                      className="restore-btn"
                      onClick={() => handleRestoreCustomer(customer.Customer_ID)}
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;