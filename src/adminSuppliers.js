import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import './adminUsers.css';
const apiUrl = window.APP_CONFIG.API_URL;

const AdminSuppliers = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/supplier-list`);

      if (response.data.success) {
        setSuppliers(response.data.data.supplierData);
      } else {
        throw new Error(response.data.error || 'Failed to fetch suppliers');
      }
    } catch (err) {
      console.error('Error fetching supplier report:', err);
      setError(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await axios.put(`${apiUrl}/api/admin/suppliers/${supplierId}/delete`);
        if (response.data.success) {
          
          fetchSuppliers();
        } else {
          setError('Failed to delete supplier');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete supplier');
      }
    }
  };

  const handleRestoreSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to restore this supplier?')) {
      try {
        const response = await axios.put(`${apiUrl}/api/admin/suppliers/${supplierId}/restore`);
        if (response.data.success) {
         
          fetchSuppliers();
        } else {
          setError('Failed to restore supplier');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to restore supplier');
      }
    }
  };

  if (!user || !user.is_admin) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div className="loading">Loading suppliers...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-users-container">
      <h1>Supplier Management</h1>
      <div className="users-table-container">
      {suppliers && suppliers.length > 0 ? (
        <table className="users-table">
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Company Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.supplier_id} className={supplier.is_deleted === 1 ? "deleted-row" : ""}>
              <td>{supplier.supplier_id}</td>
              <td>{supplier.company_name}</td>
              <td>{supplier.email}</td>
              <td>{supplier.phone_number}</td>
              <td>{supplier.is_deleted === 1 ? "Inactive" : "Active"}</td>
              <td>
                {supplier.is_deleted !== 1 ? (
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSupplier(supplier.supplier_id)}
                  >
                    Delete
                  </button>
                ) : (
                  <button 
                    className="restore-btn"
                    onClick={() => handleRestoreSupplier(supplier.supplier_id)}
                  >
                    Restore
                  </button>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      ) : (
        <div>No suppliers found</div>
      )}
      </div>
    </div>
  );
};

export default AdminSuppliers;