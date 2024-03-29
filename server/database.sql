CREATE DATABASE nuxt_booking;

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