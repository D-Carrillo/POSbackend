import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './checkout.css';

const Checkout = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [cart, setCart] = useState(null);
  const [discounts, setDiscounts] = useState(null);
  const [discountDetails, setDiscountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // Calculate totals on component mount
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('checkoutCart'));
      const savedDiscounts = JSON.parse(localStorage.getItem('appliedDiscountCodes'));
      const storedDiscountDetails = localStorage.getItem('appliedDiscountDetails');
      if (storedDiscountDetails) {
        setDiscountDetails(JSON.parse(storedDiscountDetails));
      }
      console.log('Loaded discounts:', savedDiscounts);
      console.log(savedCart);
      console.log('this', discountDetails);
      if (!savedCart || !savedCart.items || savedCart.items.length === 0) {
        window.location.href = '/shopping-cart';
        return;
      }
      if (!savedCart.totals || typeof savedCart.totals !== 'object') {
        throw new Error('Invalid cart totals');
      }
      setCart(savedCart);
      setDiscounts(savedDiscounts || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load your cart. Please try again.');
      window.location.href = '/shopping-cart';
    }
  }, []);

  useEffect(() => {
    console.log("this", discountDetails)
  }, [discountDetails]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format card number as user types
  const formatCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData(prev => ({
      ...prev,
      cardNumber: value
    }));
  };

  // Format expiry date as user types
  const formatExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setFormData(prev => ({
      ...prev,
      expiry: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cardName || !formData.cardNumber || !formData.expiry || !formData.cvv) {
      alert('Please fill in all payment fields.');
      return;
    }
    
    const cardNumber = formData.cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      alert('Please enter a valid expiration date in MM/YY format.');
      return;
    }
    
    if (!/^\d{3}$/.test(formData.cvv)) {
      alert('Please enter a valid 3-digit CVV.');
      return;
    }
  
    try {
      
      //create a transaction
      const transactionResponse = await axios.post(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/transaction`, {
        customer_id: user.id,
        total_cost: cart.totals.total,
        payment_method: 'Online',
        total_items: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        transaction_status: 1, // 1 means completed
        total_discount: (parseFloat(cart.totals.subtotal) + parseFloat(cart.totals.tax) - parseFloat(cart.totals.total)).toFixed(2)

      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      const transactionId = transactionResponse.data.transactionId;
  
      //Create a transaction item record
      const flatDiscountDetails = discountDetails?.flat() || [];

      await Promise.all(cart.items.map(async (item) => {
        const matchingDiscount = flatDiscountDetails.find(
          discount => discount.Item_ID === item.Item_ID
        );
      
        const price = parseFloat(item.price);
        const originalSubtotal = price * item.quantity;
        let discountValue = 0;
      
        if (matchingDiscount) {
          const rawValue = parseFloat(matchingDiscount.value);
          const discountType = matchingDiscount.type;
      
          if (discountType === 0) {
            // Percentage discount
            discountValue = (rawValue / 100) * originalSubtotal;
          } else if (discountType === 1) {
            // Fixed discount
            discountValue = rawValue;
          }
        }
      
        const finalPrice = originalSubtotal - discountValue;
      
        await axios.post(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/transaction-item`, {
          transaction_id: transactionId,
          item_id: item.Item_ID,
          quantity: item.quantity,
          subtotal: originalSubtotal,
          discount_id: matchingDiscount ? matchingDiscount.Discount_ID : null,
          discounted_price: finalPrice
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      
        // reduce item stock
        await axios.put(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/items/stock/${item.Item_ID}`, {
          quantity: item.quantity
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }));
      
  
      alert('Payment successful! Your order has been placed.');
      localStorage.removeItem('checkoutCart');
      localStorage.removeItem('cart');
      localStorage.removeItem('appliedDiscountCodes');
      localStorage.removeItem('appliedDiscountDetails');
      window.location.href = '/';
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('There was an error processing your order. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading your cart...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!cart || !cart.items) {
    return null;
  }
  
  if(!cart.items.length ) return <div>Loading...</div>
  return (
    <div className='bodies'>
          <div className='top-user-nav'>
            <div className="logo">
              <FontAwesomeIcon icon={faShoppingCart} />
              RetailPro
            </div>
            <div className="user-controls">             
              <div className="user-info">
                <Link to={user.type === 'customer' ? "/user-page" : "/supplier-page"}>
                  <button className="user-button">{user.first_name}</button>
                </Link>
              </div>
            </div>
          </div>      
        <div className="checkout-container">
        {/* Order Summary Section */}
        <div className="order-summary">
            <h2>Order Summary</h2>
            <div id="summary-items">
              {cart.items.map(item => (
                <div className='summary-item' key={item.Item_ID}>
                  <span>{item.Name} x {item.quantity}</span>
                  <span>${parseFloat(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row">
            <span>Subtotal</span>
            <span id="subtotal">${cart.totals.subtotal}</span>
            </div>
            {discounts && discounts.length > 0 && (
              <div className='summary-row discount-row'>
              <span>Discounts</span>
              <span id = "discount">
              -${(
                  parseFloat(cart.totals.subtotal) + 
                  parseFloat(cart.totals.tax) - 
                  parseFloat(cart.totals.total)
                ).toFixed(2)}
              </span>
            </div>)}
            {discounts && discounts.length > 0 && (
              <div className="applied-discounts">
                <small>Applied Discount Codes:</small>
                <ul>
                  {discounts.map((code, idx) => (
                    <li key={idx}>
                      <small>{code}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="summary-row">
            <span>Tax (8%)</span>
            <span id="tax">${cart.totals.tax}</span>
            </div>
            <div className="summary-row total">
            <span>Total</span>
            <span id="total">${cart.totals.total}</span>
            </div>
        </div>
        
        {/* Payment Form Section */}
        <form id="payment-form" onSubmit={handleSubmit}>
            <h2>Payment Information</h2>
            
            <label htmlFor="card-name">Cardholder Name</label>
            <input 
            type="text" 
            id="card-name"
            name="cardName" 
            placeholder="John Doe" 
            value={formData.cardName}
            onChange={handleInputChange}
            required 
            />
            
            <label htmlFor="card-number">Card Number</label>
            <input 
            type="text" 
            id="card-number" 
            placeholder="1234 5678 9012 3456" 
            maxLength="19" 
            value={formData.cardNumber}
            onChange={formatCardNumber}
            required 
            />
            
            <label htmlFor="expiry">Expiration Date</label>
            <input 
            type="text" 
            id="expiry" 
            placeholder="MM/YY" 
            maxLength="5" 
            value={formData.expiry}
            onChange={formatExpiry}
            required 
            />
            
            <label htmlFor="cvv">CVV</label>
            <input 
            type="text" 
            id="cvv" 
            name = "cvv"
            placeholder="123" 
            maxLength="3" 
            value={formData.cvv}
            onChange={handleInputChange}
            required 
            />
            
            <button type="submit" className="checkout-button">
            <FontAwesomeIcon icon={faLock} /> Place Order
            </button>
        </form>
        </div>
    </div>
  );
};

export default Checkout;