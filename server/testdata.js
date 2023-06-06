const pool = require('./db');
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");


//reset database
const createTables = async () => {

    try {
        // Drop all tables
        await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('All tables dropped successfully.');
      } catch (err) {
        console.error(err);
      }


    try {
        
        await pool.query(`
        CREATE TABLE admin (
            ID SERIAL PRIMARY KEY,
            username VARCHAR(40) UNIQUE,
            password VARCHAR(100)
        );
        
        CREATE TABLE employee (
            ID SERIAL PRIMARY KEY,
            firstname VARCHAR(100),
            surname VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(100),
            telephone VARCHAR(20)
        );
        
        CREATE TABLE client (
            ID SERIAL PRIMARY KEY,
            firstname VARCHAR(100),
            surname VARCHAR(100),
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(100),
            telephone VARCHAR(20)
        );
        
        CREATE TABLE service (
            ID SERIAL PRIMARY KEY,
            serviceName VARCHAR(40),
            PRICE NUMERIC(6, 2)
        );
        
        CREATE TABLE employee_availability (
            ID SERIAL PRIMARY KEY,
            EmployeeID INTEGER,
            AvailabilityDate DATE,
            StartTime TIME,
            EndTime TIME,
            available BOOLEAN NOT NULL,
            FOREIGN KEY (EmployeeID) REFERENCES employee(ID)
        );
        
        CREATE TABLE appointment (
            ID SERIAL PRIMARY KEY,
            appDate DATE,
            startTime TIME,
            endTime TIME,
            clientID INTEGER NOT NULL,
            employeeID INTEGER NOT NULL,
            serviceID INTEGER NOT NULL,
            FOREIGN KEY (ClientID) REFERENCES client(ID),
            FOREIGN KEY (employeeID) REFERENCES employee(ID),
            FOREIGN KEY (serviceID) REFERENCES service(ID)
        );
        
        
        CREATE DOMAIN user_type_domain AS VARCHAR(20)
        DEFAULT 'client'
        CHECK (VALUE IN ('admin', 'client', 'employee'));
        
        CREATE TABLE user_sessions (
          session_id UUID PRIMARY KEY,
          expiry_time TIMESTAMPTZ NOT NULL,
          user_id INTEGER NOT NULL,
          user_type user_type_domain NOT NULL,
          csrf_token UUID NOT NULL
        );
        
        `)

        console.log("Table successfully created")
        return;
        
    } catch (error) {
        console.log(error)
        // console.log("Tables already exist");
    }
        
}

// const createClient = async (accountObject) => {

//     try {

//         for (let accountIndex in accountObject.accounts) {
//             let account = accountObject.accounts[accountIndex];
//             console.log(`Username: ${account.username}, Email: ${account.email}`);

//             const hashEmail = CryptoJS.AES.encrypt(account.email, crykey,{ iv: iv }).toString();
//             const hashUsername = CryptoJS.AES.encrypt(account.username, crykey,{ iv: iv }).toString();
//             const existingUser = await pool.query("SELECT * FROM account WHERE username = $1 OR email = $2", [hashUsername,hashEmail]);
//             if(existingUser.rows[0]){
//                 throw new Error('Username, email or second email already taken');
//             }
//             const hashedPassword = await bcrypt.hash(account.password, 10);
    
//             const createAccount = await pool.query("INSERT INTO account (username,email,password,auth_secret) VALUES($1, $2, $3, $4) RETURNING *", [hashUsername,hashEmail,hashedPassword, AuthCode]);
//           }

//           console.log("Accounts created")

//           return;
        
//     } catch (error) {
//         console.error(error);
//     }

// }

const createAdmins = async (AdminObject) => {

    try {

        for (let adminIndex in AdminObject.admins) {
            let account = AdminObject.admins[adminIndex];
            console.log(`Username: ${account.username}`);

            const hashUsername = CryptoJS.AES.encrypt(account.username, crykey,{ iv: iv }).toString();
            const existingUser = await pool.query("SELECT * FROM admin WHERE username = $1", [hashUsername]);
            if(existingUser.rows[0]){
                throw new Error('Username already taken');
            }
            const hashedPassword = await bcrypt.hash(account.password, 10);
    
            const createAdmin = await pool.query("INSERT INTO admin (username, password) VALUES($1, $2) RETURNING *", [hashUsername, hashedPassword]);
          
        };

          console.log("Admins created")

          return;
        
    } catch (error) {
        console.error(error);
    }

}

// const accountObject = {
//     "accounts": [
//         {
//             "username": "harryR",
//             "email": "harryR@email.com",
//             "password": "sugar123",
//         },
//         {
//             "username": "zakb",
//             "email": "zakb@email.com",
//             "password": "massiverugbylegs",
//         },
//         {
//             "username": "andyN",
//             "email": "andyN@email.com",
//             "password": "ilovewoody",
//         },
//         {
//             "username": "finM",
//             "email": "finM@email.com",
//             "password": "ilovedrones",
//         }
// ]
// };

const AdminObject = {
    "admins": [
        {
            "username": "harryR",
            "password": "password",
        }
]
}

const main = async () => {
    try {
      await createTables();
      await createAdmins(AdminObject);
      process.exit(0);
    } catch (error) {
      console.error(error);
    }
  }
  
main();




