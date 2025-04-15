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
                                maxLength={1}
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
                            <label>Day of Birth</label>
                            <input
                                type="date"
                                required
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Enter your example.com email</label>
                            <input
                                type="email"
                                id="email"
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={30}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="Password">Enter Password</label>
                            <input
                                type="password"
                                maxLength={30}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="form-section">
                        <h2>Address Information</h2>
                        <div className="form-group">
                            <label>Apartment Number</label>
                            <input
                                type="number"
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
                                type="number"
                                required
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                            />
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
                </form>
            </div>
        </div>
    );
}

export default SupplierForm;
