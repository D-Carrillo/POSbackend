import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import './user-page.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reportTabs from './reportTabs';
import {
  faShoppingCart,

} from '@fortawesome/free-solid-svg-icons';
import ReportTabs from './reportTabs';

Chart.register(...registerables);


const UserPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [period, setPeriod] = useState('weekly');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedTransactions, setExpandedTransactions] = useState([]);
    const [transactions, setTransactions] = useState(null);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [returnItems, setReturnItems] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [transactionItems, setTransactionItems] = useState([]);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [userData, setUserData] = useState({
        first_name: '',
        middle_Initial: '',
        last_Name: '',
        Phone_Number: '',
        Email: '',
        Apt_number: '',
        House_num: '',
        Street: '',
        City: '',
        state: '',
        Country: '',
        Zip_code: '',
        DOB: '',
        Payment_method: 'Card'
    });

    useEffect(() => { 
            fetchCustomerReports();
            fetchUserData();
            fetchTransactions();
            fetchReturnsItems();
        }
    , [period, user?.id]);

    const fetchCustomerReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/reports/${period}/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setReportData(response.data);
        }catch (err) {
            setError(err.response?.data?.message || 'Failed to load reports');
            console.error('Report error: ', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/auth/user/${user.type}/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Fetched user data:', response.data);
            setUserData(response.data);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
    };

    const fetchTransactions = async () => {
        if (!user?.id) return;
        try {
            const response = await axios.get(`pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/userTransactions/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(response.data);
            setTransactions(response.data?.transactions || []);
            setItems(response.data?.items || []);
            setTransactionItems(response.data?.transactionItems || []);
        }catch (err) {
            console.error('Failed to fetch transactions:', err);
            setTransactions([]);
            setItems([]);
        }
    };

    const toggleTransaction = (transactionID) => {
        setExpandedTransactions(prev =>
            prev.includes(transactionID)
            ? prev.filter(id => id !== transactionID) : [...prev, transactionID]
        );
    };

    const getStatusText = (status) => {
        switch(status) {
            case 0: return 'Return in Process';
            case 1: return 'Completed';
            case 2: return 'Return Completed';
            case 3: return 'Return Declined';
            default: return 'Unknown';
        }
    };

    const getItemsForTransaction = (transactionId) => {
        return transactionItems.filter(item => item.Transaction_ID === Number(transactionId));
        
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
                DOB: userData.DOB ? userData.DOB.split('T')[0] : null
            };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined || updateData[key] === '') {
                    delete updateData[key];
                }
            });
    
            console.log('Sending update:', updateData); 
            const response = await axios.put(
                `pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/auth/update/${user.type}/${user.id}`,
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
                last_Name: updateData.last_Name
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setEditMode(false);
            alert('Profile updated successfully!');
    
        } catch (err) {
            console.error('Update error:', {
                message: err.message,
                response: err.response?.data
            });
            alert(err.response?.data?.error || 'Failed to update profile');
        }
    };

    const handleSignOut = async () => {
        localStorage.clear();
        window.location.href = '/';

    };

    const handleLanding = () => {
        window.location.href = '/';
    }

    const handleDeleteAccount = async () => {

        if (!window.confirm(`Delete your ${user.type} account?`)) return;

            
        try {
            const endpoint = `pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/auth/deletion/${user.type}/${user.id}`;

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

    const handleReturn = async (transactionId, itemId) => {
        const returnReason = prompt("Reason for return:" );
        if (!returnReason) return;

        try {
            const response = await axios.post(
                `pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/returns`, {
                    transaction_id: transactionId,
                    item_id: itemId,
                    return_reason: returnReason
                }, {
                    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
                }
            );
            alert(`Return Initiated. Refund Amount: $${parseFloat(response.data.refund_amount * 1.08).toFixed(2)}`);
            fetchTransactions();
            setReturnItems(prev => [...prev, { 
                Transaction_ID: transactionId, 
                Item_ID: itemId 
            }]);
    
        }catch (err) {
            alert('Return Failed. Please try again.');
        }
    };

    const fetchReturnsItems = async () => {

        try {
            const response = await axios.get(
                `pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/getReturns`, {
                    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
                }
            );
            setReturnItems(response.data.return);
        }catch (err) {
            alert('Return Failed. Please try again.');
        }
    };

    const toggleTransactionHistory = () => {
        setShowTransactionHistory(prev => !prev);
    };


    

    return (
        <div className="user-page">
            <div className='top-user-nav'>
                    <div className="logo">
                <FontAwesomeIcon icon={faShoppingCart} />
                CheckMate
                </div>
                <div className="user-controls">
                {/* <Link to="/shopping-cart">
                    <button className="cart-button" title="View Shopping Cart">
                    <FontAwesomeIcon icon={faShoppingCart} />
                    </button>
                </Link> */}
                <div className="user-info">
                    <Link to={user.type === 'customer' ? "/user-page" : "/supplier-page"}>
                        <button className="user-button">{user.first_name}</button>
                    </Link>
                </div>
                </div>
            </div>

            <h1>Welcome, {user.first_name} {user.last_Name}</h1>

            <div className = "profile-section">
                <h2>Your Profile</h2>
                {editMode ? (
                        <div className="edit-profile-form">
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number*</label>
                                    <input
                                        type="tel"
                                        name="Phone_Number"
                                        value={userData.Phone_Number}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="DOB"
                                        //change
                                        value={userData.DOB ? userData.DOB.split('T')[0] : ""}
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
                                    <label>Zip Code*</label>
                                    <input
                                        type="text"
                                        name="Zip_code"
                                        value={userData.Zip_code}
                                        onChange={handleInputChange}
                                        required
                                    />
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
                                    <label>Payment Method*</label>
                                    <select
                                        name="Payment_method"
                                        value={userData.Payment_method}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="Online">Online</option>
                                        <option value="Other">Other</option>
                                    </select>
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
                                <h3>Personal Information</h3>
                                <p><strong>Name:</strong> {userData.first_name} {userData.middle_Initial && `${userData.middle_Initial}. `}{userData.last_Name}</p>
                                <p><strong>Email:</strong> {userData.Email}</p>
                                <p><strong>Phone:</strong> {userData.Phone_Number}</p>
                                <p><strong>Date of Birth:</strong> {userData.DOB?.split('T')[0] || 'Not specified'}</p>
                                <p><strong>Payment Method:</strong> {userData.Payment_method}</p>
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

            <div className='report-section'>
                <h2>Purchase History</h2>

                    <div className='transaction-history-section'>
                        <button 
                            onClick={toggleTransactionHistory}
                            className='transaction-history-toggle'
                        >
                            {showTransactionHistory ? 'Hide' : 'Show'} Transaction History
                        </button>
                    

                        {showTransactionHistory && (
                            <table className='transaction-table'>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Transaction ID</th>
                                        <th>Total Cost</th>
                                        <th>Status</th>
                                        <th>Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions === null ? (
                                        <tr>
                                            <td colSpan="6" className="loading-message">Loading transactions...</td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="no-transactions">No transactions found</td>
                                        </tr>
                                    ) : (
                                        transactions.map(transaction => (
                                            <React.Fragment key={transaction.Transaction_ID}>
                                                <tr className='main-transaction-row'>
                                                    <td>{new Date(transaction.sale_time).toLocaleDateString()}</td>
                                                    <td>{transaction.Transaction_ID}</td> 
                                                    <td>${transaction.Total_cost}</td>
                                                    <td>{getStatusText(transaction.Transaction_Status)}</td>
                                                    <td>
                                                        <button 
                                                            onClick={() => toggleTransaction(transaction.Transaction_ID)}
                                                            className='toggle-items-button'
                                                        >
                                                            {expandedTransactions.includes(transaction.Transaction_ID) ? 'Hide Items' : 'Show Items'}
                                                        </button>
                                                    </td>
                                                    <td></td>
                                                </tr>

                                                {console.log(returnItems)}
                                                {expandedTransactions.includes(transaction.Transaction_ID) && 
                                                    getItemsForTransaction(transaction.Transaction_ID).map(item => (
                                                        <tr key={`${transaction.Transaction_ID}-${item.Item_ID}`} className='item-row'>
                                                            <td colSpan="2">
                                                                <strong>{item.item_name}</strong> 
                                                                <div className='item-description'>{item.item_description}</div>
                                                            </td>
                                                            <td>
                                                                {item.Quantity} × ${item.item_price}
                                                            </td>
                                                            <td>
                                                                {item.Discount_ID !== null ? (
                                                                    <>
                                                                        <span className='original-price'>${item.Subtotal}</span>
                                                                        <span className='discounted-price'>${item.Discounted_Price}</span>
                                                                    </>
                                                                ) : (`$${item.Subtotal}`)}
                                                            </td>
                                                            <td>
                                                                {/* Check if the current item is in the returnItems list */}
                                                                {returnItems.some(returnItem => 
                                                                    returnItem.Transaction_ID === transaction.Transaction_ID && 
                                                                    returnItem.Item_ID === item.Item_ID 
                                                                ) ? (
                                                                    transaction.Transaction_Status === 2 ? (
                                                                    <span className="returned">Returned</span>
                                                                    ) : 
                                                                    transaction.Transaction_Status === 0 ? (
                                                                        <span className='returned'>Return in Proccess</span>
                                                                    ) : null
                                                                ) : (
                                                        
                                                                    <button 
                                                                        className='return-button'
                                                                        onClick={() => handleReturn(transaction.Transaction_ID, item.Item_ID)}
                                                                    >
                                                                        Request Return
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    ))
                                                }

                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

            <ReportTabs user = {user}/>

            <button onClick = {handleSignOut} className='signout-button'>Sign Out</button>
            <button onClick={handleLanding} className="signout-button">Home page</button>
            <button onClick={handleDeleteAccount} className="signout-button">
                Delete Acount
            </button>
            
        </div>
        </div>
    );
};

export default UserPage;
