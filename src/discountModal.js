import React, { useState, useEffect } from 'react';
import './discountModal.css';

const DiscountModal = ({ isOpen, onClose, onSubmit, itemId}) => {
    const [discountData, setDiscountData] = useState ({
        name: '',
        value:'',
        type: '0',
        startDate:'',
        endDate:'',
        itemId: itemId,
        is_deleted: '0'
    });

    useEffect(() => {
        setDiscountData(prev => ({
          ...prev,
          itemId: itemId
        }));
      }, [itemId]); 


    const handleChange = (e) => {
        const {name, value} = e.target;
        setDiscountData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(discountData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className='discount-modal-overlay'>
            <div className='discount-modal'>
                <button className='close-button-modal' onClick={onClose}>x</button>
                <h3>Create Discount</h3>
                <form onSubmit={handleSubmit}>
                    <div className = "form-group">
                        <label>Discount Name</label>
                        <input
                            className='model-input' 
                            type = "text"
                            name = "name"
                            value = {discountData.name}
                            onChange = {handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Discount Type</label>
                        <select
                            className='model-select' 
                            name = "type"
                            value = {discountData.type}
                            onChange = {handleChange}
                            required
                        >
                            <option value = "0">Percentage (%)</option>
                            <option value = "1">Fixed Amount ($)</option>
                        </select>
                    </div>

                    <div className='form-group'>
                        <label>Value</label>
                        <input 
                            className='model-input' 
                            type="number"
                            name="value"
                            value={discountData.value}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <div className='form-row'>
                        <div className='form-group'>
                            <label>Start Date</label>
                            <input 
                                className='model-input' 
                                type="date"
                                name="startDate"
                                value = {discountData.startDate}
                                onChange = {handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label>End Date</label>
                        <input 
                            className='model-input' 
                            type="date"
                            name="endDate"
                            value={discountData.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {discountData.itemId && (
                        <div className='form-group'>
                            <label>Item ID</label>
                            <input  
                                className='model-input' 
                                type="text"
                                value={discountData.itemId}
                                readOnly
                                disabled
                            />
                        </div>
                    )}

                    <button className='submit-button-model'>
                        Save Discount
                    </button>
                </form>
            </div>
        </div>

    )
};

export default DiscountModal;
