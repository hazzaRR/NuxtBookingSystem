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
            FOREIGN KEY (EmployeeID) REFERENCES employee(ID),
            CONSTRAINT unique_availability UNIQUE (EmployeeID, AvailabilityDate, StartTime, EndTime)
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

const createClient = async (ClientObject) => {

    try {

        for (let index in ClientObject.clients) {
            let client = ClientObject.clients[index];

            const hashEmail = CryptoJS.AES.encrypt(client.email, crykey,{ iv: iv }).toString();

            const existingUser = await pool.query("SELECT * FROM client WHERE email = $1", [hashEmail]);
            if(existingUser.rows[0]){
                throw new Error('email already taken');
            }
            const hashedPassword = await bcrypt.hash(client.password, 10);
    
            const createAccount = await pool.query("INSERT INTO client (firstname, surname, email, password, telephone) VALUES($1, $2, $3, $4, $5) RETURNING *", [client.firstname, client.surname, hashEmail, hashedPassword, client.telephone]);
          }

          console.log("Accounts created")

          return;
        
    } catch (error) {
        console.error(error);
    }

}

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

};

const createEmployees = async (employeeObject) => {

    try {

        for (let employeeIndex in employeeObject.employees) {
            let account = employeeObject.employees[employeeIndex];
            console.log(`email: ${account.email}`);

            const hashEmail = CryptoJS.AES.encrypt(account.email, crykey,{ iv: iv }).toString();
            const existingUser = await pool.query("SELECT * FROM employee WHERE email = $1", [hashEmail]);
            if(existingUser.rows[0]){
                throw new Error('Email already taken');
            }
            const hashedPassword = await bcrypt.hash(account.password, 10);
    
            const createEmployee = await pool.query("INSERT INTO employee (firstname, surname, email, password, telephone) VALUES($1, $2, $3, $4, $5) RETURNING *", [account.firstname, account.surname, hashEmail, hashedPassword, account.telephone]);
          
        };

          console.log("Employees created")

          return;
        
    } catch (error) {
        console.error(error);
    }

};

const createServices = async () => {

    try {

        let addServices = await pool.query("INSERT INTO service (serviceName, Price) VALUES ('Basic Haircut', 25.00)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price) VALUES ('Mens Haircut', 30.00)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price) VALUES ('Womens Haircut', 35.00)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price) VALUES ('Childrens Haircut', 20.00)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price) VALUES ('Senior Haircut', 22.50)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price) VALUES ('Beard Trim', 15.00)");


        console.log("Services created successfully");
        
    } catch (error) {

        console.log(error.message)
        
    }
};

const createAppointments = async (AppointmentObject) => {

    try {

        for (let index in AppointmentObject.appointments) {
            let appointment = AppointmentObject.appointments[index];
    
            const createAppointment = await pool.query("INSERT INTO appointment (appDate, startTime, endTime, clientID, employeeID, serviceID) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [appointment.appDate, appointment.startTime, appointment.endTime, appointment.clientID, appointment.employeeID, appointment.serviceID]);
          
        };

          console.log("Employees created")

          return;
        
    } catch (error) {
        console.error(error);
    }

};


const ClientObject = {
    "clients": [
        {
          "ID": 1,
          "firstname": "John",
          "surname": "Doe",
          "email": "johndoe1@example.com",
          "password": "password123",
          "telephone": "555-1234"
        },
        {
          "ID": 2,
          "firstname": "Jane",
          "surname": "Smith",
          "email": "janesmith@example.com",
          "password": "pass456",
          "telephone": "555-5678"
        },
        {
          "ID": 3,
          "firstname": "Michael",
          "surname": "Johnson",
          "email": "michaeljohnson@example.com",
          "password": "abc789",
          "telephone": "555-9012"
        }
      ]
};


const AdminObject = {
    "admins": [
        {
            "username": "harryR",
            "password": "password",
        }
]
}

const employeeObject = {
    "employees": [
        {
            "firstname": "John",
            "surname": "Doe",
            "email": "johndoe@example.com",
            "password": "mypassword",
            "telephone": "1234567890"
          },
          {
            "firstname": "Jane",
            "surname": "Smith",
            "email": "janesmith1@example.com",
            "password": "secretpass",
            "telephone": "9876543210"
          },
          {
            "firstname": "Alice",
            "surname": "Johnson",
            "email": "alicejohnson@example.com",
            "password": "pass123",
            "telephone": "5551234567"
          }
]
}

const AppointmentObject = {
    "appointments": [
            {
              "ID": 1,
              "appDate": "2023-06-18",
              "startTime": "09:00:00",
              "endTime": "10:00:00",
              "clientID": 1,
              "employeeID": 1,
              "serviceID": 1
            },
            {
              "ID": 2,
              "appDate": "2023-06-13",
              "startTime": "10:30:00",
              "endTime": "11:30:00",
              "clientID": 2,
              "employeeID": 2,
              "serviceID": 2
            },
            {
              "ID": 3,
              "appDate": "2023-06-19",
              "startTime": "14:00:00",
              "endTime": "15:00:00",
              "clientID": 1,
              "employeeID": 3,
              "serviceID": 3
            }
        ]
}

const main = async () => {
    try {
      await createTables();
      await createAdmins(AdminObject);
      await createEmployees(employeeObject);
      await createClient(ClientObject);
      await createServices();
      await createAppointments(AppointmentObject);
      process.exit(0);
    } catch (error) {
      console.error(error);
    }
  }
  
main();




