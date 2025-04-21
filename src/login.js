import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './login.css';
const apiUrl = window.APP_CONFIG.API_URL;


const Login = () => {
    //all onsubmit variables 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [typeOfUser, setTypeOfUser] = useState('customer');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, {
              email,
              password,
              typeOfUser
            });
            
            if (response.data?.user){
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/';
            }else {
                throw new Error('No user data received');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError (errorMessage);
        }
    };


    return (
        <div className = "firstlogin" >
            <div className = "container">
                <div className="image-section">
                    <img src="store.jpg" alt="Image of a store" />
                </div>

                {/*the actual login part */}
                <div className = "login-container">
                    <h2>Login</h2>
                    <div className = "tabs">
                        <button 
                            className = {`tab ${typeOfUser === 'customer' ? 'active': ''}`}
                            onClick = { () => setTypeOfUser('customer')}
                            >
                                Customer 
                        </button>
                        <button 
                            className = {`tab ${typeOfUser === 'supplier' ? 'active': ''}`}
                            onClick = { () => setTypeOfUser('supplier')}
                            >
                                Supplier 
                        </button>
                    </div>
                    <div className="box">
                        <form onSubmit = {handleSubmit}> 
                            <div>
                                <label>Email:</label>
                                <input 
                                    type = "email"
                                    value = {email}
                                    onChange = { (e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input 
                                    type = "password"
                                    value = {password}
                                    onChange = { (e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type = "submit">Login</button>
                        </form>
                        <p>
                            Don't have an account? <Link to = {typeOfUser === 'supplier' ? '/supplier-entry-form' : '/customer-entry-form'}>Sign Up</Link> 
                            
                        </p>
                        

                        {error && (
                            <div className="error-message-for-login" style={{
                            color: '#002366',
                            padding: '10px',
                            margin: '10px 0',
                            border: '1px dark red',
                            borderRadius: '4px',
                            backgroundColor: '#ffebee'
                            }}>
                            ⚠️ Unable to Access
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;