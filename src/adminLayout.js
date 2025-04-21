
import React from 'react';
import { Link, Outlet, useNavigate, Navigate } from 'react-router-dom';
import './adminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user || !user.is_admin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <ul>
            <li>
              <Link to="/customers">
                <i className="fas fa-users"></i> Customers
              </Link>
            </li>
            <li>
              <Link to="/products">
                <i className="fas fa-boxes"></i> Products
              </Link>
            </li>
            <li>
              <Link to="/suppliers">
                <i className="fas fa-truck"></i> Suppliers
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-user">
            <span>Welcome, {user.first_name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;