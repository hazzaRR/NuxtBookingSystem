CREATE DATABASE nuxt_booking;

--\c into beauty_room

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
    Price NUMERIC(6, 2)
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
  csrf_token UUID NOT NULL,
);