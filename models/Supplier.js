const db = require('../config/db');

class Supplier {
  static findByEmail(email, phone, callback) {
    const safeEmail = email ? String(email) : null;
    const safePhone = phone ? String(phone) : null;
    

    db.query(
      'SELECT * FROM supplier WHERE (email = ? OR Phone_Number = ?) AND is_deleted = 0',
      [safeEmail, safePhone],
      callback
    );
  }

  static create(supplierData, callback) {
    const nullify = (value) => (value === '' ? null : value);
    
    const sanitize = (value) => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'string') return value.trim();
      return String(value);
    };

    const { company, firstName, middleInitial, lastName, phoneNumber, email, 
            aptNum, houseNum, street, city, selectedState, zip, 
            selectedCountry, password, dob } = supplierData;

    const insertData = {
      Company_Name: sanitize(company),
      first_name: sanitize(firstName),
      middle_Initial: nullify(middleInitial),
      last_Name: sanitize(lastName),
      Phone_Number: nullify(phoneNumber) ? sanitize(phoneNumber) : null,
      Email: sanitize(email),
      Apt_number: nullify(aptNum),
      House_num: nullify(houseNum),
      Street: nullify(street),
      City: nullify(city),  
      State: nullify(selectedState),
      Zip_code: nullify(zip),
      Country: nullify(selectedCountry),
      password: nullify(password),
      DOB: nullify(dob)
    };


    db.query(
      'INSERT INTO supplier SET ?',
      insertData,
      callback
    );
  }
}

module.exports = Supplier;