import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
 
  login: (email, password, userType) => 
    api.post('/auth/login', { email, password, typeOfUser: userType }),

 
  registerCustomer: (customerData) => 
    api.post('/customer-entry-form', customerData),


  registerSupplier: (supplierData) => 
    api.post('/supplier-entry-form', supplierData),
};
