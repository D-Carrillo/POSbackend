import { useState } from "react";
import axios from 'axios';
import './item-entry.css';

const ItemEntryForm = () => {
    {/* Variables that the customer would contain */ }
    const { id } = JSON.parse(localStorage.getItem('user'));
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [quantity, setItemQuantity] = useState(null);
    const [price, setPrice] = useState(null);
    const [reorderThreshold, setReorderThreshold] = useState(null);
    const [category, setCategory] = useState(null);
    const [imageURL, setImageURL] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    {/* Function to place all the values into item once submit  is hit */ }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/items/item-entry`, {
                itemName, itemDescription, price, quantity, reorderThreshold, id, category, imageURL
            });
            if (response.data?.itemId) {
                window.location.href = '/supplier-page';
            } else {
                throw new Error('No user data received');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Sign up failed';
            setError(errorMessage);
        }
    }

    return (
        <div className="first">
            <div className="customerEntryForm">
                <h1>Create Item</h1>
                <form onSubmit={handleSubmit}>

                    {/* Item Section */}
                    <div className="form-section">
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                type="text"
                                required
                                maxLength={20}
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Item Description</label>
                            <input
                                type="text"
                                required
                                
                                value={itemDescription}
                                onChange={(e) => setItemDescription(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select</option>
                                <option value='1'>Electronics</option>
                                <option value='2'>Clothing</option>
                                <option value='3'>Home & Kitchen</option>
                                <option value='4'>Sporting Goods</option>
                                <option value='5'>Business & Industrial</option>
                                <option value='6'>Jewelry & Watches</option>
                                <option value='7'>Refurbished</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                required
                                value={quantity}
                                onChange={(e) => setItemQuantity(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Reorder Threshold</label>
                            <input
                                type="number"
                                value={reorderThreshold}
                                onChange={(e) => setReorderThreshold(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                type="text"
                                value={imageURL}
                                onChange={(e) => setImageURL(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <small style={{ color: '#666', fontSize: '12px' }}>
                        Image should have 1:1 ratio and have a transparent background for best results.
                    </small>
                    {error && (
                            <div className="error-message-for-login" style={{
                            color: '#002366',
                            padding: '10px',
                            margin: '10px 0',
                            border: '1px dark red',
                            borderRadius: '4px',
                            backgroundColor: '#ffebee'
                            }}>
                            ⚠️ Wrong Information or Item Already exitst
                            </div>
                        )}
                    {/* Submit Button */}
                    <div className="form-group">
                        <button type="submit">Submit</button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default ItemEntryForm;
