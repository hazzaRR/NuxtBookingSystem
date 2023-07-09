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
          Price NUMERIC(6, 2),
          duration_minutes INTEGER
      );
      
      CREATE DOMAIN day_of_week_domain AS VARCHAR(20)
      CHECK (VALUE IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'));
      
      CREATE TABLE employee_availability (
          ID SERIAL PRIMARY KEY,
          EmployeeID INTEGER,
          DayOfWeek day_of_week_domain,
          StartTime TIME,
          EndTime TIME,
          available BOOLEAN NOT NULL,
          FOREIGN KEY (EmployeeID) REFERENCES employee(ID),
          CONSTRAINT unique_availability UNIQUE (EmployeeID, DayOfWeek)
      );
      
      
      CREATE TABLE employee_blocked_days (
        ID SERIAL PRIMARY KEY,
        employeeID INTEGER NOT NULL,
        blockedDate DATE,
        FOREIGN KEY (employeeID) REFERENCES employee(ID),
        CONSTRAINT unique_blockedDay UNIQUE (employeeID, blockedDate)
    );

    CREATE TABLE employee_one_off_availability (
      ID SERIAL PRIMARY KEY,
      EmployeeID INTEGER,
      AdjustedDate DATE,
      StartTime TIME,
      EndTime TIME,
      FOREIGN KEY (EmployeeID) REFERENCES employee(ID),
      CONSTRAINT unique_one_off_availability UNIQUE (EmployeeID, AdjustedDate)
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
          FOREIGN KEY (serviceID) REFERENCES service(ID),
          CONSTRAINT unique_appointment UNIQUE (EmployeeID, appDate, StartTime, EndTime)
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


            const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

            weekdays.forEach(async (weekday) => {
    
                const availability = await pool.query("INSERT INTO employee_availability (DayOfWeek, employeeID, available) VALUES($1, $2, $3)", [weekday, createEmployee.rows[0].id, false]);
            });
          
        };

          console.log("Employees created")

          return;
        
    } catch (error) {
        console.error(error);
    }

};

const createServices = async () => {

    try {

        let addServices = await pool.query("INSERT INTO service (serviceName, Price, duration_minutes) VALUES ('Basic Haircut', 25.00, 30)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price, duration_minutes) VALUES ('Mens Haircut', 30.00, 45)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price, duration_minutes) VALUES ('Womens Haircut', 35.00, 60)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price, duration_minutes) VALUES ('Childrens Haircut', 20.00, 30)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price, duration_minutes) VALUES ('Senior Haircut', 22.50, 30)");
        addServices = await pool.query("INSERT INTO service (serviceName, Price,duration_minutes) VALUES ('Beard Trim', 15.00, 15)");


        console.log("Services created successfully");
        
    } catch (error) {

        console.log(error.message)
        
    }
};

const updateAvailability = async (AvailabilityObject) => {

  try {

    for (let index in AvailabilityObject.availability) {
        let availability = AvailabilityObject.availability[index];

        if (availability.available === false) {

          const updateAvail = await pool.query("UPDATE employee_availability SET starttime = $1, endtime = $2, available = $3 WHERE employeeid = $4 AND DayOfWeek = $5", [null, null, availability.available, availability.EmployeeID, availability.DayOfWeek]);
      }
      else {
          const updateAvail = await pool.query("UPDATE employee_availability SET starttime = $1, endtime = $2, available = $3 WHERE employeeid = $4 AND DayOfWeek = $5", [availability.StartTime, availability.EndTime, availability.available, availability.EmployeeID, availability.DayOfWeek]);
      }
      
    };

      console.log("Availability created")

      return;
    
} catch (error) {
    console.error(error);
}

}

const createBlockedDate = async (object) => {

  try {

    for (let index in object.blockedDays) {
        let blockedDate = object.blockedDays[index];

          const updateAvail = await pool.query("INSERT INTO employee_blocked_days (employeeid, blockedDate) VALUES ($1, $2)", [blockedDate.EmployeeID, blockedDate.blockedDate]);
      
    };

      console.log("Blocked date created")

      return;
    
} catch (error) {
    console.error(error);
}




}

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


const userObject = {
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
    ],
    "admins": [
        {
            "username": "harryR",
            "password": "password",
        }
    ],
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
};

const AvailabilityObject = {
  "availability": [
    {
      "EmployeeID": 1,
      "DayOfWeek": "Monday",
      "StartTime": "09:00:00",
      "EndTime": "17:00:00",
      "available": true
    },
    {
      "EmployeeID": 1,
      "DayOfWeek": "Tuesday",
      "StartTime": "08:30:00",
      "EndTime": "16:30:00",
      "available": true
    },
    {
      "EmployeeID": 1,
      "DayOfWeek": "Wednesday",
      "StartTime": null,
      "EndTime": null,
      "available": false
    },
    {
      "EmployeeID": 1,
      "DayOfWeek": "Thursday",
      "StartTime": "08:00:00",
      "EndTime": "16:00:00",
      "available": true
    },
    {
      "EmployeeID": 1,
      "DayOfWeek": "Friday",
      "StartTime": "09:30:00",
      "EndTime": "17:30:00",
      "available": true
    },
    {
      "EmployeeID": 1,
      "DayOfWeek": "Saturday",
      "StartTime": "10:00:00",
      "EndTime": "16:00:00",
      "available": true
    },
    {
      "EmployeeID": 1,
      "DayOfWeek": "Sunday",
      "StartTime": null,
      "EndTime": null,
      "available": false
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Monday",
      "StartTime": null,
      "EndTime": null,
      "available": false
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Tuesday",
      "StartTime": "09:00:00",
      "EndTime": "17:00:00",
      "available": true
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Wednesday",
      "StartTime": "08:30:00",
      "EndTime": "16:30:00",
      "available": true
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Thursday",
      "StartTime": "08:00:00",
      "EndTime": "16:00:00",
      "available": true
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Friday",
      "StartTime": "09:30:00",
      "EndTime": "17:30:00",
      "available": true
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Saturday",
      "StartTime": "10:00:00",
      "EndTime": "16:00:00",
      "available": true
    },
    {
      "EmployeeID": 2,
      "DayOfWeek": "Sunday",
      "StartTime": null,
      "EndTime": null,
      "available": false
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Monday",
      "StartTime": "09:00:00",
      "EndTime": "17:00:00",
      "available": true
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Tuesday",
      "StartTime": "08:30:00",
      "EndTime": "16:30:00",
      "available": true
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Wednesday",
      "StartTime": "10:00:00",
      "EndTime": "18:00:00",
      "available": false
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Thursday",
      "StartTime": "08:00:00",
      "EndTime": "16:00:00",
      "available": true
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Friday",
      "StartTime": "09:30:00",
      "EndTime": "17:30:00",
      "available": false
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Saturday",
      "StartTime": "10:00:00",
      "EndTime": "16:00:00",
      "available": true
    },
    {
      "EmployeeID": 3,
      "DayOfWeek": "Sunday",
      "StartTime": "12:00:00",
      "EndTime": "18:00:00",
      "available": true
    }
  ],
  "blockedDays": [
    {
      "EmployeeID": 1,
      "blockedDate": "2023-07-06"
    }
  ]
}

const AppointmentObject = {   
    "appointments": [
            {
              "ID": 1,
              "appDate": new Date().toISOString().slice(0,10),
              "startTime": "13:00:00",
              "endTime": "13:30:00",
              "clientID": 1,
              "employeeID": 1,
              "serviceID": 1
            },
            {
              "ID": 2,
              "appDate": new Date().toISOString().slice(0,10),
              "StartTime": "09:00:00",
              "EndTime": "09:30:00",
              "clientID": 2,
              "employeeID": 2,
              "serviceID": 2
            },
            {
              "ID": 3,
              "appDate": new Date().toISOString().slice(0,10),
              "startTime": "14:00:00",
              "endTime": "15:00:00",
              "clientID": 1,
              "employeeID": 3,
              "serviceID": 3
            }
        ],
}

const main = async () => {
    try {
      await createTables();
      await createAdmins(userObject);
      await createEmployees(userObject);
      await createClient(userObject);
      await updateAvailability(AvailabilityObject);
      await createBlockedDate(AvailabilityObject);
      await createServices();
      await createAppointments(AppointmentObject);
      process.exit(0);
    } catch (error) {
      console.error(error);
    }
  }
  
main();




