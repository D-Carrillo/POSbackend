import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './adminUsers.css';
const apiUrl = window.APP_CONFIG.API_URL;

const AdminProducts = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/admin/products`);
      if (response.data.success) {
        const processedProducts = response.data.data.map(product => ({
          ...product,
          Price: parseFloat(product.Price) || 0
        }));
        setProducts(processedProducts);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteProduct = async (supplierId, productName) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.put(`${apiUrl}/api/admin/products/delete`, {
          supplierId: supplierId,
          productName: productName
        });
        if (response.data.success) {
          fetchItems();
        } else {
          setError('Failed to delete product');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete product');
      }
    }
  };

  const handleRestoreProduct = async (supplierId, productName) => {
    if (window.confirm('Are you sure you want to restore this product?')) {
      try {
        const response = await axios.put(`${apiUrl}/api/admin/products/restore`, {
          supplierId: supplierId,
          productName: productName
        });
        if (response.data.success) {
          fetchItems();
        } else {
          setError('Failed to restore product');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to restore product');
      }
    }
  };

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'number' ? price : parseFloat(price);
    return isNaN(numericPrice) ? '$0.00' : `$${numericPrice.toFixed(2)}`;
  };

  return (
    <div className="admin-users-container">
      <h2>Product Management</h2>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Company Name</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={`${product.supplier_id}-${product.name}`} className={product.is_deleted ? "deleted-row" : ""}>
                <td>{product.supplier_id}</td>
                <td>{product.company_name}</td>
                <td>{product.name}</td>
                <td>{product.stock_quantity}</td>
                <td>{formatPrice(product.Price)}</td>
                <td>{product.is_deleted ? "Inactive" : "Active"}</td>
                <td>
                  {!product.is_deleted ? (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(product.supplier_id, product.name)}
                    >
                      Delete
                    </button>
                  ) : (
                    <button 
                      className="restore-btn"
                      onClick={() => handleRestoreProduct(product.supplier_id, product.name)}
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

export default AdminProducts;