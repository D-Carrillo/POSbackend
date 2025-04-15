const db = require('../config/db');

class Supplier {
  static findByEmail(email, callback) {
    db.query('SELECT * FROM supplier WHERE email = ?', [email], callback);
  }

  static create(supplierData, callback) {
    const nullify = (value) => (value === '' ? null : value);
    const { company, firstName, middleInitial, lastName, phoneNumber, email, aptNum, houseNum, street, city, selectedState, zip, selectedCountry, password, dob } = supplierData;
    
    db.query(
      'INSERT INTO supplier SET ?', 
      {
        Company_Name: company,
        first_name: firstName,
        middle_Initial: nullify(middleInitial),
        last_Name: lastName,
        Phone_Number: nullify(phoneNumber),
        Email: email,
        Apt_number: nullify(aptNum),
        House_num: nullify(houseNum),
        Street: nullify(street),
        City: nullify(city),
        State: nullify(selectedState),
        Zip_code: nullify(zip),
        Country: nullify(selectedCountry),
        password: nullify(password),
        DOB: nullify(dob)
      },
      callback
    );
  }
}

module.exports = Supplier;