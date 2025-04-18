import React, { useState, useEffect, useMemo, useCallback } from 'react';
import "./shopping-cart.css";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faExpand, 
  faShoppingCart,   
  faTrash, 
  faArrowLeft, 
  faMinus, 
  faPlus, 
  faTimes, 
  faLock 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faCcVisa, 
  faCcMastercard, 
  faCcAmex, 
  faCcPaypal 
} from '@fortawesome/free-brands-svg-icons';

const ShoppingCart = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCodes, setAppliedCodes] = useState([]);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [discountDetails, setDiscountDetails] = useState([]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const storedCodes = localStorage.getItem("appliedDiscountCodes");
    try {
      const parsed = JSON.parse(storedCodes);
      if (Array.isArray(parsed)) {
        setAppliedCodes(parsed);
      } else {
        setAppliedCodes([]);
      }
    } catch (err) {
      console.error("Error parsing appliedDiscountCodes", err);
      setAppliedCodes([]);
    }
  }, []);
  


  useEffect(() => {
    const fetchDiscountDetails = async () => {
      try {
        const responses = await Promise.all(
          appliedCodes.map(code => 
            axios.get(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/getDiscountsByName/${code}`)
          )
        );
        const details = responses.map(response => response.data[0]);
        const validDetails = details.filter(Boolean); // Remove any undefined values
        localStorage.setItem("appliedDiscountDetails", JSON.stringify(validDetails));
        setDiscountDetails(validDetails);
      } catch (err) {
        console.error("Failed to fetch discount details", err);
      }
    };
    
    if (appliedCodes.length > 0) {
      fetchDiscountDetails();
    } else {
      setDiscountDetails([]);
    }
  }, [appliedCodes]);


  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError("Please enter a discount code");
      return;
    }
  
    try {
      const response = await axios.get(`https://pointofsalebackend-cfayfdbafzeqfdcd.eastus-01.azurewebsites.net/api/getDiscountsByName/${discountCode}`);
      const discountData = response.data[0][0]; 

      console.log(discountData);
  
      if (!discountData ||
          typeof discountData !== 'object' ||
          discountData.Name === null || 
          discountData.value === null ||
          discountData.type === null) {
        setError("Invalid discount code structure");
        return;
      }
  
      if (appliedCodes.some(Name => Name.toLowerCase() === discountCode.toLowerCase())) {
        setError("Discount code already applied");
        return;
      }
  
      const updatedCodes = [...appliedCodes, discountData.Name]; 
      console.log(updatedCodes);
      setAppliedCodes(updatedCodes);
      localStorage.setItem("appliedDiscountCodes", JSON.stringify(updatedCodes));
  
      setDiscountCode("");
      setError("");
      
    } catch (err) {
      setError("Invalid or expired discount code");
    }
  };

  const handleRemoveCode = (codeToRemove) => {
    const updatedCodes = appliedCodes.filter((code) => code !== codeToRemove);
    setAppliedCodes(updatedCodes);
    localStorage.setItem("appliedDiscountCodes", JSON.stringify(updatedCodes));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const continueShopping = () => {
    // Navigate to index page
    window.location.href = '/';
  };

  const updateQuantity = (Item_ID, newQuantity) => {
    setCartItems(cartItems.map(item => 
      item.Item_ID === Item_ID ? { ...item, quantity:
         Math.max(1, Math.min(item.stock_quantity, newQuantity || 99, newQuantity || 1)) 
        } : item
    ));
  };

  const removeItem = (Item_ID) => {
    setCartItems(cartItems.filter(item => item.Item_ID !== Item_ID));
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      setAppliedCodes([]);
      setDiscountDetails([]);
    }
  };

  const calculateTotals = useCallback(() => {
    console.log('Calculating totals...', cartItems, discountDetails);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let totalDiscount = 0;
    
    cartItems.forEach(item => {
      discountDetails.forEach(discount => {
        if (!discount || !Array.isArray(discount) || !discount[0]) return; 
        
        const discountObj = discount[0]; 
        if (discountObj.Item_ID === item.Item_ID) {
          if (discountObj.type === 0) {
            totalDiscount += item.price * item.quantity * (discountObj.value / 100);
          } else if (discountObj.type === 1) {
            totalDiscount += discountObj.value * item.quantity;
          }
        }
      });
    });
    
    totalDiscount = Math.min(totalDiscount, subtotal);
    const discountedSubtotal = subtotal - totalDiscount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;
    
    console.log({subtotal, totalDiscount, discountedSubtotal, tax, total});
    
    return {
      subtotal: subtotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      discountedSubtotal: discountedSubtotal.toFixed(2)
    };
  }, [cartItems, discountDetails]);
  

  const totals = useMemo(() => calculateTotals(), [cartItems, discountDetails, calculateTotals]);


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your card is empty!');
      return;
    }

    localStorage.setItem('checkoutCart', JSON.stringify({
      items: cartItems,
      totals:calculateTotals()
    }));

    window.location.href ='/checkout';
  }


  return (
    <div className="shopping-container">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="logo">
          <FontAwesomeIcon icon={faShoppingCart} />
          RetailPro
        </div>
        

        
        {/* User Controls */}
        <div className="user-controls">
          <button className="cart-button active" id="cart-button" title="View Shopping Cart">
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="cart-count">{cartItems.length}</span>
          </button>
          <div className="user-info">
            <Link to = "/user-page">
              <button className = "user-button">{user.first_name}</button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Area */}
    <div className="landing-main-area">
        
        
        {/* Main Content */}
        <div className = "main-content-container">
            <main className={`main-content ${sidebarCollapsed ? 'full-width' : ''}`} id="main-content">
            <div className="cart-header">
                <h1><FontAwesomeIcon icon={faShoppingCart} /> Shopping Cart</h1>
                <div className="cart-actions">
                <button className="btn-secondary" onClick = {clearCart}><FontAwesomeIcon icon={faTrash} /> Clear Cart</button>
                <button className="btn-primary continue-shopping" onClick={continueShopping}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                </button>
                </div>
            </div>
            
            <div className="Cart-container">
                <div className="cart-items">
                {cartItems.length === 0 && (
                  <div className = "empty-cart">
                    <p>Your cart is empty</p>
                    <button onClick = {continueShopping}>Continue Shopping</button>
                  </div>
                )}
                {cartItems.map(item => (
                    <div className="cart-item" key={item.Item_ID}>
                    <div className="item-image">
                        <img src={item.image_url} alt={item.Name} />
                    </div>
                    <div className="item-details">
                        <div className="item-name">{item.Name}</div>
                        {/* <div className="item-sku">SKU: {item.sku}</div> */}
                    </div>
                    <div className="item-price">${Number(item.price || item.Price).toFixed(2)}</div>
                    <div className="item-quantity">
                        <button 
                        className="quantity-btn decrease" 
                        onClick={() => updateQuantity(item.Item_ID, item.quantity - 1)}
                        >
                        <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <input 
                        type="number" 
                        value={item.quantity} 
                        min="1" 
                        max={item.maxQuantity}
                        onChange={(e) => updateQuantity(item.Item_ID, parseInt(e.target.value) || 1)}
                        />
                        <button 
                        className="quantity-btn increase" 
                        onClick={() => updateQuantity(item.Item_ID, item.quantity + 1)}
                        >
                        <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                    <div className="item-total">${Number(item.price || item.Price * item.quantity).toFixed(2)}</div>
                    <div className="item-actions">
                        <button className="remove-item" onClick={() => removeItem(item.Item_ID)}>
                        <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    </div>
                ))}
                </div>
                
                <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${totals.subtotal}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className='summary-row discount-applied'>
                    <span>Discount</span>
                    <span>-${totals.totalDiscount}</span>
                  </div>
                )}
                {totals.totalDiscount > 0 && (
                  <div className='summary-row discount-subtotal'>
                    <span>Discounted Subtotal</span>
                    <span>${totals.discountedSubtotal}</span>
                  </div>
                )}
                <div className="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                </div>
                <div className="summary-row">
                    <span>Tax (8%)</span>
                    <span>${totals.tax}</span>
                </div>
                <div className="summary-row discount">
                    <div className="discount-input">
                    <input 
                      type="text"
                      placeholder="Discount Code" 
                      value = {discountCode}
                      onChange = {(e) => setDiscountCode(e.target.value)}/>
                    <button onClick={handleApplyDiscount}>Apply</button>
                    </div>
                    {error && <p className='error-message'>{error}</p>}
                </div>
                {appliedCodes.length > 0 && (
                  <div className='applied-discounts'>
                    <p>Applied Discount:</p>
                    <ul>
                      {appliedCodes.map((code) => (
                        <li key = {code}>
                          "{code}" <button className = "remove-item-discount" onClick={() => handleRemoveCode(code)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="summary-row total">
                    <span>Total</span>
                    <span>${totals.total}</span>
                </div>
                <Link to="/checkout" onClick={handleCheckout}>
                    <button className="checkout-page">
                        <FontAwesomeIcon icon={faLock} /> Proceed to Checkout
                    </button>
                </Link>
                <div className="payment-methods">
                    <FontAwesomeIcon icon={faCcVisa} />
                    <FontAwesomeIcon icon={faCcMastercard} />
                    <FontAwesomeIcon icon={faCcAmex} />
                    <FontAwesomeIcon icon={faCcPaypal} />
                </div>
                </div>
            </div>
            </main>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;