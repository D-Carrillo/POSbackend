import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSync } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import DiscountModal from './discountModal';
import SupplierSalesReport from './SupplierSalesReport';
import TopSellingItemsReport from './TopSellingItemsReport';
import DiscountReport from './discountReport';
import axios from 'axios';
import "./supplier-page.css";

const SupplierPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [reportData, setReportData] = useState([]);
    const [period, setPeriod] = useState('weekly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const salesReportRef = useRef(null);
    const topItemsReportRef = useRef(null);
    const discountReportRef = useRef(null);
    const [tempItemData, setTempItemData] = useState({
        Name: '',
        description: '',
        price: 0,
        quantity: 0
    });
    const [userData, setUserData] = useState({
        Company_Name: '',
        first_name: '',
        middle_Initial: '',
        last_Name: '',
        Phone_Number: '',
        Email: '',
        Apt_number: '',
        House_num: '',
        Street: '',
        City: '',
        State: '',
        Country: '',
        Zip_code: '',
        DOB: ''
    });
    const apiUrl = process.env.REACT_APP_API_URL;

    
    const fetchSupplierReport = async () => {
        if (!user?.id) {
            setError('Supplier ID not available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${apiUrl}/api/reports/supplier/${user.id}`, {
                params: { period },
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            setReportData(response.data);
        } catch (err) {
            console.error('Error fetching supplier report:', err);
            setError('Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplierReport();
        fetchUserData();
        fetchSupplierProducts();
        fetchDiscounts();
    }, [period, user?.id, lastRefreshTime]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleRefreshAllData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        console.log(discounts);
    }, [discounts]);

    const fetchDiscounts = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/getDiscounts/${user.id}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            setDiscounts(response.data);
            console.log(discounts);
        } catch (err) {
            console.error('Failed to get discount', err);
        };
    }

    const fetchSupplierProducts = async () => {
        if (!user?.id) {
            setProductsError('Supplier ID not available');
            return;
        }

        setProductsLoading(true);
        setProductsError(null);

        try {
            const response = await axios.get(`${apiUrl}/api/items/supplier/${user.id}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching supplier products:', err);
            setProductsError('Failed to fetch products');
        } finally {
            setProductsLoading(false);
        };
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/auth/user/${user.type}/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            setUserData(response.data);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
    };

   const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSave = async () => {
        try {
            const updateData = {
                ...userData,
                //change from DOB to dob
                dob: userData.dob ? userData.dob.split('T')[0] : null
            };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined || updateData[key] === '') {
                    delete updateData[key];
                }
            });

            const response = await axios.put(
                `${apiUrl}/auth/update/${user.type}/${user.id}`,
                updateData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const updatedUser = {
                ...user,
                first_name: updateData.first_name,
                last_Name: updateData.last_Name,
                Company_Name: updateData.Company_Name
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setEditMode(false);
            alert('Profile updated successfully!');

        } catch (err) {
            console.error('Update error:', err);
            alert(err.response?.data?.error || 'Failed to update profile');
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const handleItemAdd = () => {
        window.location.href = "/item-entry";
    }

    const handleDeleteAccount = async () => {
        if (!window.confirm(`Delete your ${user.type} account?`)) return;

        try {
            const endpoint = `${apiUrl}/auth/deletion/${user.type}/${user.id}`;

            const response = await axios.patch(endpoint, {
                headers: {  'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });

            if(response.data.success) {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }catch (err){
            console.error('Failed delete account:', err);
            alert("Unable to delete account");
        };
    }

    const handleDelete = async (item_Id) => {
        if (!window.confirm('Are you sure you want to delete this Product?')) return;

        try {
            await axios.post(`${apiUrl}/api/items/deleteitem/${item_Id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });

            handleRefreshAllData();
            alert('Item deleted successfully');
          } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete item');
          }
    };

    const startEditing = (product) => {
        setEditingItem(product.item_id);
        setTempItemData({
          Name: product.Name,
          description: product.description,
          price: product.price,
          quantity: product.quantity
        });
    };

    const cancelEditing = () => {
        setEditingItem(null);
    };

    const handleTempChange = (e) => {
        const { name, value } = e.target;
        setTempItemData(prev => ({
          ...prev,
          [name]: name === 'price' || name === 'quantity' ? Number(value) : value
        }));
    };

    const saveChanges = async () => {
        try {
          await axios.put(
            `${apiUrl}/api/items/modify/${editingItem}`,
            tempItemData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          handleRefreshAllData();
          setEditingItem(null);
          alert('Item updated successfully!');
        } catch (err) {
          console.error('Update failed:', err);
          alert('Failed to update item');
        }
    };

    const handleCreateDiscount = async (discountData) => {
        console.log(discountData);
        try {
            await axios.put(
                `${apiUrl}/api/addDiscount`,
                discountData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            handleRefreshAllData();
            alert(`Discount "${discountData.name}" added`);
        }catch (err) {
            console.error('Discount failed:', err);
            alert('Failed to add discount');
        }
    };

    const handleDeleteDiscount = async (discountId) => {
        try {
            if (!window.confirm('Are you sure you want to delete this Discount?')) return;
            await axios.post(
                `${apiUrl}/api/deleteDiscount/${discountId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                }
                }
            );
            handleRefreshAllData();
        } catch (err) {
            console.error('Failed to delete discount:', err);
            setProducts(prevProducts =>
                prevProducts.map(product => ({
                ...product,
                discounts: product.discounts || []
            }))
          );
        }
      };

    const handleLanding = () => {
        window.location.href = '/';
    }



    const handleRefreshAllData = () => {
        setLastRefreshTime(Date.now());
        fetchSupplierReport();
        fetchSupplierProducts();
        fetchDiscounts();

        // Try to refresh child components if refs are available
        if (salesReportRef.current && typeof salesReportRef.current.refreshData === 'function') {
            salesReportRef.current.refreshData();
        }
        if (topItemsReportRef.current && typeof topItemsReportRef.current.refreshData === 'function') {
            topItemsReportRef.current.refreshData();
        }
        if (discountReportRef.current && typeof discountReportRef.current.refreshData === 'function') {
            discountReportRef.current.refreshData();
        }
    };

    const renderTabs = () => (
        <div className="supplier-tabs">
            <button
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('profile');
                    handleRefreshAllData();
                }}
            >
                Profile & Products
            </button>
            <button
                className={`tab-button ${activeTab === 'sales-summary' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('sales-summary');
                    handleRefreshAllData();
                }}
            >
                Sales Summary Report
            </button>
            <button
                className={`tab-button ${activeTab === 'top-items' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('top-items');
                    handleRefreshAllData();
                }}
            >
                Top Selling Items
            </button>
            <button
                className={`tab-button ${activeTab === 'discount' ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('discount');
                    handleRefreshAllData();
                }}
            >
                Discount
            </button>
            <button
                className="refresh-button"
                onClick={handleRefreshAllData}
                title="Refresh All Data"
            >
                <FontAwesomeIcon icon={faSync} /> Refresh Data
            </button>
        </div>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'sales-summary':
                return (
                    <div className="report-section" key={`sales-${lastRefreshTime}`}>
                        <SupplierSalesReport supplierId={user.id} ref={salesReportRef} />
                    </div>
                );
            case 'top-items':
                return (
                    <div className="report-section" key={`top-items-${lastRefreshTime}`}>
                        <TopSellingItemsReport supplierId={user.id} siteWide={false} ref={topItemsReportRef} />
                    </div>
                );
            case 'discount':
                return (
                    <div className="report-section" key={`discount-${lastRefreshTime}`}>
                        <DiscountReport supplierId={user.id} ref={discountReportRef} />
                    </div>
                );
            case 'profile':
            default:
                return (
                    <>
                        <div className="profile-section">
                            <h2>Your Profile</h2>
                            {console.log("thisthisthis", userData)}
                            {editMode ? (
                                <div className="edit-profile-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Company Name*</label>
                                            <input
                                                type="text"
                                                name="Company_Name"
                                                value={userData.Company_Name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name*</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={userData.first_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Middle Initial</label>
                                            <input
                                                type="text"
                                                name="middle_Initial"
                                                value={userData.middle_Initial}
                                                onChange={handleInputChange}
                                                maxLength="1"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name*</label>
                                            <input
                                                type="text"
                                                name="last_Name"
                                                value={userData.last_Name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Email*</label>
                                            <input
                                                type="email"
                                                name="Email"
                                                value={userData.Email}
                                                onChange={handleInputChange}
                                                required
                                                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                                title="Please enter a valid email address"
                                                maxLength={30}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number*</label>
                                            <input
                                                type="tel"
                                                name="Phone_Number"
                                                pattern="\d{10}"
                                                maxLength={10}
                                                value={userData.Phone_Number}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={userData.dob ? userData.dob.split('T')[0] : ""}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>House Number*</label>
                                            <input
                                                type="text"
                                                name="House_num"
                                                value={userData.House_num}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Apartment Number</label>
                                            <input
                                                type="text"
                                                name="Apt_number"
                                                value={userData.Apt_number}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Street*</label>
                                            <input
                                                type="text"
                                                name="Street"
                                                value={userData.Street}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City*</label>
                                            <input
                                                type="text"
                                                name="City"
                                                value={userData.City}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>State Abbreviation*</label>
                                            <input
                                                type="text"
                                                name="state"
                                                maxLength="5"
                                                value={userData.state}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Zip Code*</label>
                                            <input
                                                type="text"
                                                name="Zip_code"
                                                value={userData.Zip_code}
                                                onChange={handleInputChange}
                                                maxLength="5"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Country*</label>
                                            <input
                                                type="text"
                                                name="Country"
                                                value={userData.Country}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" onClick={() => setEditMode(false)} className="cancel-button">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleSave} className="save-button">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-info">
                                    <div className="info-section">
                                        <h3>Company Information</h3>
                                        <p><strong>Company Name:</strong> {userData.Company_Name}</p>
                                        <p><strong>Contact Person:</strong> {userData.first_name} {userData.middle_Initial && `${userData.middle_Initial}. `}{userData.last_Name}</p>
                                        <p><strong>Email:</strong> {userData.Email}</p>
                                        <p><strong>Phone:</strong> {userData.Phone_Number}</p>
                                        <p><strong>Date of Birth:</strong> {userData.dob?.split('T')[0] || 'Not specified'}</p>
                                    </div>
                                    <div className="info-section">
                                        <h3>Address</h3>
                                        <p>
                                            {userData.House_num}
                                            {userData.Apt_number && `, Apt ${userData.Apt_number}`}
                                            {userData.Street && `, ${userData.Street}`}
                                        </p>
                                        <p>
                                            {userData.City && `${userData.City}, `}
                                            {userData.state} {userData.Zip_code}
                                        </p>
                                        <p>{userData.Country}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="edit-profile-button"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="products-section">
                            <h2>Your Products</h2>
                            {productsLoading && <p>Loading products...</p>}
                            {productsError && <p className="error">{productsError}</p>}
                            {!productsLoading && !productsError && products.length > 0 ? (
                                <table className="products-table">
                                <thead>
                                    <tr>
                                    <th>Item Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Modify</th>
                                    <th>Add Discount</th>
                                    <th>Delete</th>
                                    <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => {
                                    const isExpanded = expandedProductId === product.item_id;
                                    return (
                                        <React.Fragment key={product.item_id}>
                                        {/* Main Product Row */}
                                        <tr className='main-product-row'>
                                            <td>
                                            {editingItem === product.item_id ? (
                                                <input
                                                type="text"
                                                name="Name"
                                                value={tempItemData.Name || ''}
                                                onChange={handleTempChange}
                                                className="edit-input"
                                                />
                                            ) : (
                                                product.Name
                                            )}
                                            </td>
                                            <td>
                                            {editingItem === product.item_id ? (
                                                <input
                                                type="text"
                                                name="description"
                                                value={tempItemData.description || ''}
                                                onChange={handleTempChange}
                                                className="edit-input"
                                                />
                                            ) : (
                                                product.description
                                            )}
                                            </td>
                                            <td>
                                            {editingItem === product.item_id ? (
                                                <input
                                                type="number"
                                                step="0.01"
                                                name="price"
                                                value={tempItemData.price || ''}
                                                onChange={handleTempChange}
                                                className="edit-input"
                                                />
                                            ) : (
                                                `$${Number(product.price).toFixed(2)}`
                                            )}
                                            </td>
                                            <td>
                                            {editingItem === product.item_id ? (
                                                <input
                                                type="number"
                                                name="quantity"
                                                value={tempItemData.quantity || ''}
                                                onChange={handleTempChange}
                                                className="edit-input"
                                                />
                                            ) : (
                                                product.quantity
                                            )}
                                            </td>
                                            <td className='action-buttons'>
                                            {editingItem === product.item_id ? (
                                                <>
                                                <button
                                                    onClick={saveChanges}
                                                    className="save-button"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="cancel-button"
                                                >
                                                    Cancel
                                                </button>
                                                </>
                                            ) : (
                                                <button
                                                onClick={() => startEditing(product)}
                                                className="modify-button"
                                                >
                                                Modify
                                                </button>
                                            )}
                                            </td>
                                            <td className="action-buttons">
                                            <button
                                                onClick={() => {
                                                setSelectedItemId(product.item_id);
                                                setIsModalOpen(true);
                                                }}
                                                className="discount-button"
                                            >
                                                Add Discount
                                            </button>
                                            <DiscountModal
                                                isOpen={isModalOpen}
                                                onClose={() => setIsModalOpen(false)}
                                                onSubmit={handleCreateDiscount}
                                                itemId={selectedItemId}
                                            />
                                            </td>
                                            <td className='action-buttons'>
                                            <button
                                                onClick={() => handleDelete(product.item_id)}
                                                className="delete-button"
                                                disabled={editingItem === product.item_id}
                                            >
                                                Delete
                                            </button>
                                            </td>
                                            <td>
                                            <button
                                                onClick={() => setExpandedProductId(isExpanded ? null : product.item_id)}
                                                className='toggle-discounts-button'
                                            >
                                                {isExpanded ? 'Hide Discounts' : 'Show Discounts'}
                                            </button>
                                            </td>
                                        </tr>



                                        {isExpanded && (
                                            <>
                                                {discounts && discounts.filter(discount => Number(discount.item_id) === Number(product.item_id)).length > 0 ? (
                                                    discounts.filter(discount => Number(discount.item_id) === Number(product.item_id)).map(discount => (
                                                        <tr key={`${product.item_id}-${discount.discount_id}`} className='discount-row'>
                                                        <td colSpan="3">
                                                            <strong>{discount.Name}</strong>
                                                            <span className='discount-details'>
                                                            {discount.value}% | {new Date(discount.Start_Date).toLocaleDateString()} to {new Date(discount.End_Date).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td colSpan="3">
                                                            <div className='discount-type'>
                                                            {discount.type === 0 ? "Percentage" : "Fixed Amount"}
                                                            </div>
                                                        </td>
                                                        <td colSpan="2" className='action-buttons'>
                                                            <button
                                                            onClick={() => handleDeleteDiscount(discount.discount_id)}
                                                            className='delete-discount-button'
                                                            >
                                                            Delete Discount
                                                            </button>
                                                        </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                <tr className='discount-row'>
                                                    <td colSpan="8" className="no-discounts">
                                                    No discounts available
                                                    </td>
                                                </tr>
                                                )}
                                            </>
                                            )}

                                        </React.Fragment>
                                    );
                                    })}
                                </tbody>
                                </table>
                            ) : (
                                !productsLoading && <p>No products found.</p>
                            )}
                            <button className="Add-item-button" onClick={handleItemAdd}>Add Item</button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="user-page">
            <div className='top-user-nav'>
                <div className="logo">
                    <FontAwesomeIcon icon={faShoppingCart} />
                    CheckMate
                </div>
                <div className="user-controls">
                    <div className="user-info">
                        <Link to={user.type === 'customer' ? "/user-page" : "/supplier-page"}>
                          <button className="user-button">{user.first_name}</button>
                        </Link>
                    </div>
                </div>
            </div>

            <h1>Welcome, {userData.Company_Name || `${user.first_name} ${user.last_Name}`}</h1>

            {renderTabs()}

            {renderContent()}

            <div className="footer-controls">
                <button onClick={handleSignOut} className="signout-button">Sign Out</button>
                <button onClick={handleLanding} className="signout-button">Home page</button>
                <button onClick={handleDeleteAccount} className="signout-button">
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default SupplierPage;