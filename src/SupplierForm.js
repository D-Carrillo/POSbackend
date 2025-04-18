//needs the "country-state-city" library
import { useState } from "react";
import axios from 'axios';
import { Country, State } from 'country-state-city';
import './SupplierForm.css';

const SupplierForm = () => {
    {/* Variables that the customer would contain */}
    const [firstName, setfirstName] = useState('');
    const [middleInitial, setmiddleInitial] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [aptNum, setAptNum] = useState(null);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [houseNum, sethouseNum] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [company, setCompany] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [error, setError] = useState('');
    

    const countries = Country.getAllCountries();
    const state = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];

    {/* Function to place all the values into customer once hit submit */}
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/supplier-entry-form`, {
            company, firstName, middleInitial, lastName, phoneNumber, email, aptNum, houseNum, street, city, selectedState, zip, selectedCountry, password, dob
          });
          if (response.data?.user){
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
        }else {
            throw new Error('No user data received');
        }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Sign up failed';
            setError (errorMessage);
        }
    }

    return (
        <div className="first-section">
            <div className="customerEntryForm">
                <h1>Supplier Sign Up</h1>
                <form onSubmit={handleSubmit}>

                    {/* Personal Information Section */}
                    <div className="form-section">
                        <h2>Personal Information</h2>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input
                                type="text"
                                required
                                maxLength={20}
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                required
                                maxLength={20}
                                value={firstName}
                                onChange={(e) => setfirstName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Middle Initial</label>
                            <input
                                type="text"
                                maxLength="1"
                                value={middleInitial}
                                onChange={(e) => setmiddleInitial(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                required
                                maxLength={30}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                required
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                title="You must be at least 18 years old"
                            />
                            {dob && new Date(dob) > new Date(new Date().setFullYear(new Date().getFullYear() - 18)) && (
                                <span className="error-text">You must be at least 18 years old</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) setPhoneNumber(value);
                                }}
                                required
                                pattern="\d{10}"
                                maxLength={10}
                            />
                            {phoneNumber.length !== 10 && phoneNumber.length > 0 && (
                            <span className="error-text">Phone number must be 10 digits</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Enter your email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                title="Please enter a valid email address"
                                maxLength={30}
                            />
                            {email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email) && (
                                <span className="error-text">Please enter a valid email</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Enter Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                maxLength={30}
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                                title="Must contain at least one number, one uppercase and lowercase letter, and at least 8 characters"
                            />
                            {password.length > 0 && password.length < 8 && (
                                <span className="error-text">Password must be at least 8 characters</span>
                            )}
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="form-section">
                        <h2>Address Information</h2>
                        <div className="form-group">
                            <label>Apartment Number</label>
                            <input
                                type="number"
                                min = "0"
                                value={aptNum}
                                onChange={(e) => setAptNum(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>House Number</label>
                            <input
                                type="number"
                                value={houseNum}
                                required
                                onChange={(e) => sethouseNum(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Street Name</label>
                            <input
                                type="text"
                                required
                                maxLength={50}
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>City Name</label>
                            <input
                                type="text"
                                required
                                maxLength={40}
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Zip Code</label>
                            <input
                                type="text"
                                value={zip}
                                onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d{0,5}$/.test(value)) {
                                    setZip(value);
                                }
                                }}
                                required
                                pattern="\d{5}"
                                title="Please enter a 5-digit zip code"
                                maxLength="5"
                            />
                            {zip.length !== 5 && zip.length > 0 && (
                                <span className="error-text">Zip code must be 5 digits</span>
                            )}
                        </div>
                    </div>

                    {/* Location Information Section */}
                    <div className="form-section">
                        <h2>Location Information</h2>
                        <div className="form-group">
                            <label>Country</label>
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                            >
                                <option value="">Select a country</option>
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>State Abbreviation</label>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                disabled={!selectedCountry}
                            >
                                <option value="">Select a state</option>
                                {state.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-group">
                        <button type="submit">Submit</button>
                    </div>
                    {error && (
                            <div className="error-message-for-login" style={{
                            color: '#002366',
                            padding: '10px',
                            margin: '10px 0',
                            border: '1px dark red',
                            borderRadius: '4px',
                            backgroundColor: '#ffebee'
                            }}>
                            ⚠️ Email or Phone Number already on the system
                            </div>
                        )}
                </form>
            </div>
        </div>
    );
}

export default SupplierForm;
