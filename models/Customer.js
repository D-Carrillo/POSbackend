const db = require('../config/db');

class Customer {

    static findByEmail(email, callback) {
        db.query('SELECT Customer_ID, first_name, last_name, password FROM customer WHERE Email = ?', [email], callback);
      }

  static create(customerData, callback) {
    const { firstName, middleInitial, lastName, phoneNumber, email, aptNum, houseNum, street, city, selectedState, zip, selectedCountry, dob, payment, password } = customerData;
    
    db.query(
      'INSERT INTO customer SET ?', 
      {
        first_name: firstName,
        middle_Initial: middleInitial,
        last_Name: lastName,
        Phone_Number: phoneNumber,
        Email: email,
        Apt_number: Number(aptNum),
        House_num: houseNum,
        Street: street,
        City: city,
        state: selectedState,
        Zip_code: zip,
        Country: selectedCountry,
        DOB: dob,
        Payment_method: payment,
        password: password
      },
      callback
    );
  }
}

module.exports = Customer;