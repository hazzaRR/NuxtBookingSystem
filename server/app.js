const express = require('express');
const app = express();
const cors = require("cors");
const pool = require("./db");
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require("crypto-js");
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5001;
require('dotenv').config();


app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));
app.use(cookieParser());

app.get('/auth-check', async (req, res) => {

    const {auth_token} = req.cookies;

    if (!auth_token) {
        console.log("no auth")
        return res.status(401).json({message: "Unable to authenticate session"});
    }

    const user_session = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [auth_token]);

    // console.log(user_session.rows[0])

    if (!user_session.rows[0]) {
        return res.status(403).json({message: "Unable to authenticate session"});
    }

    if (user_session.rows[0].expiry_time < new Date()) {
        const delete_session = await pool.query('DELETE FROM user_sessions WHERE session_id = $1', [auth_token]);
        res.clearCookie('auth_token');
        return res.status(403).json({message: "Unable to authenticate session"});
    }

    // console.log("authenticated")
    return res.status(200).json({message: "Authenticated", user_type: user_session.rows[0].user_type});
});

app.post("/register", async (req, res) => {

    try {
        let {email, password, firstname, surname, telephone} = req.body;

        //Returns random delay to combat against account enuneration
        // await delay(500, 1500);


        // Encrypts personal details with cryptojs
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        
        // Searches into database based on username and email and returns status code if existing user already exists
        const existingUser = await pool.query("SELECT * FROM client WHERE email = $1 UNION SELECT * FROM employee WHERE email = $1", [hashEmail]);
        if(existingUser.rows[0]){
            return res.status(409).json({ message: 'Register Invalid'});
        }

        //Hashes password and inserts into database, if any error in inserting then register invalid is returned.
        const hashedPassword = await bcrypt.hash(password, 10);
        const account = await pool.query("INSERT INTO client (email,password, firstname, surname, telephone) VALUES($1, $2, $3, $4, $5) RETURNING *", [hashEmail,hashedPassword, firstname, surname, telephone]);
        const info = await pool.query('SELECT * FROM client WHERE email = $1', [hashEmail])
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }

        const token = uuidv4();
        const crsf_token = uuidv4();
        const currentDate = new Date();
        // Add 2 hours to the current time
        const expiry_time = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
        const createSession = await pool.query('INSERT INTO user_sessions (session_id, expiry_time, user_id, user_type, csrf_token)  VALUES($1, $2, $3, $4, $5) RETURNING *', [token, expiry_time, info.rows[0].id, "client", crsf_token])

        res.cookie('auth_token', token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true, secure: true}); // Set cookie to expire in 10 minutes
        res.json({ message: 'Log in successful', user_type: createSession.rows[0].user_type });

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error creating user"});
    }

});

app.post("/login", async (req, res) => {

    let {email,password} = req.body;

    try {

        //Encrypts email and then checks it against the database
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();

        const Admininfo = await pool.query('SELECT * FROM admin WHERE username = $1', [hashEmail])
        const Clientinfo = await pool.query('SELECT * FROM client WHERE email = $1', [hashEmail])
        const Employeeinfo = await pool.query('SELECT * FROM employee WHERE email = $1', [hashEmail])

        //Returns random delay to combat against account enuneration but is rarely needed for validate_auth_request filtering through also having delay
        // await delay(500, 1500);
        // console.log('here')
        if(!Clientinfo.rows[0] && !Admininfo.rows[0] && !Employeeinfo.rows[0]){
            return res.status(409).json({ message: 'Error with authentication'});
        }
        
        let isPasswordValid;
        let isAdmin;
        let isEmployee;
        let user_id;
        let user_type;
        const token = uuidv4();
        const crsf_token = uuidv4();
        if (Clientinfo.rows[0]) {
            isPasswordValid = await bcrypt.compare(password, Clientinfo.rows[0].password);
            isAdmin = false;
            isEmployee = false;
            user_id = Clientinfo.rows[0].id;
            user_type = 'client';

        }
        else if (Employeeinfo.rows[0]) {
            isPasswordValid = await bcrypt.compare(password, Employeeinfo.rows[0].password);
            isAdmin = false;
            isEmployee = true;
            user_id = Employeeinfo.rows[0].id;
            user_type = 'employee';
        }
        else {
            isPasswordValid = await bcrypt.compare(password, Admininfo.rows[0].password);
            isAdmin = true;
            isEmployee = false;
            user_id = Admininfo.rows[0].id;
            user_type = 'admin';
        }

        // console.log(isPasswordValid)
        if (!isPasswordValid) {
            return res.status(409).json({ message: 'Error with authentication'});
        }

        const currentDate = new Date();

        // Add 2 hours to the current time
        const expiry_time = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);

        const createSession = await pool.query('INSERT INTO user_sessions (session_id, expiry_time, user_id, user_type, csrf_token)  VALUES($1, $2, $3, $4, $5) RETURNING *', [token, expiry_time, user_id, user_type, crsf_token])

        res.cookie('auth_token', token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true, secure: true}); // Set cookie to expire in 10 minutes
        res.json({ message: 'Log in successful', user_type: createSession.rows[0].user_type});

    } catch (err) {
        console.log(err);
        res.json({ message: 'Ahh error happened'})
    }
});

app.get('/logout', async (req, res) => {

    try {
        //Removes user tokens and csrf tokens, clears cookies and then forces the user to go back to main page
        const auth_token = req.cookies.token;

        const stored_session = await pool.query('DELETE FROM user_sessions WHERE session_id = $1', [auth_token])

        res.clearCookie('auth_token'); // Clear the 'token' cookie
        res.json({message: 'Logged out successfully'});
    } catch (error) {
        res.status(402).json({ message: 'Error' });
    }
});

app.post("/employee/register", async (req, res) => {
    try {
        let {email, password, firstname, surname} = req.body;

        console.log("we got here");

        //Returns random delay to combat against account enuneration
        // await delay(500, 1500);


        // Encrypts personal details with cryptojs
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        
        // Searches into database based on username and email and returns status code if existing user already exists
        const existingUser = await pool.query("SELECT * FROM client WHERE email = $1 UNION SELECT * FROM employee WHERE email = $1", [hashEmail]);
        if(existingUser.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }

        //Hashes password and inserts into database, if any error in inserting then register invalid is returned.
        const hashedPassword = await bcrypt.hash(password, 10);
        const account = await pool.query("INSERT INTO employee (email,password, firstname, surname) VALUES($1, $2, $3, $4) RETURNING *", [hashEmail,hashedPassword, firstname, surname]);
        const info = await pool.query('SELECT * FROM employee WHERE email = $1', [hashEmail])
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }

        const token = uuidv4();
        const crsf_token = uuidv4();
        const currentDate = new Date();
        // Add 2 hours to the current time
        const expiry_time = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
        const createSession = await pool.query('INSERT INTO user_sessions (session_id, expiry_time, user_id, user_type, csrf_token)  VALUES($1, $2, $3, $4, $5) RETURNING *', [token, expiry_time, info.rows[0].id, "client", crsf_token])

        res.cookie('auth_token', token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true, secure: true}); // Set cookie to expire in 10 minutes
        res.json({ message: 'Log in successful', user_type: createSession.rows[0].user_type });

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error creating user"});
    }

});

app.get("/services", async (req, res) => {


    try {

        const getServices = await pool.query("SELECT * FROM service");


        return res.json({message:"Services fetched successfully", services: getServices.rows})
        
    } catch (error) {
        return res.status(500).json({message:"Error accessing database"});
    }
});

app.get("/available-employees", async (req, res) => {


    try {

        const {date} = req.query;

        console.log(date)

        const getEmployees = await pool.query("SELECT DISTINCT employee.id, employee.firstname, employee.surname FROM employee INNER JOIN employee_availability ON employee_availability.employeeid = employee.id WHERE employee_availability.AvailabilityDate = $1 AND employee_availability.available = $2", [date, true]);


        return res.json({message:"Employees Successfully fetched", employees: getEmployees.rows})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error accessing database"});
    }
});

app.get("/available-appointments", async (req, res) => {


    try {

        const {date, id} = req.query;

        const getAvailability = await pool.query("SELECT employee_availability.starttime, employee_availability.endtime FROM employee_availability INNER JOIN employee ON employee_availability.employeeid = employee.id WHERE employee_availability.AvailabilityDate = $1 AND employee_availability.employeeid = $2 AND employee_availability.available = $3", [date, id, true]);


        return res.json({message:"Services fetched successfully", availability: getAvailability.rows})
        
    } catch (error) {
        return res.status(500).json({message:"Error accessing database"});
    }
});

const adminRouter = require('./routes/adminRouter');
const employeeRouter = require('./routes/employeeRouter');
const clientRouter = require('./routes/clientRouter');


app.use('/admin', adminRouter);
app.use('/employee', employeeRouter);
app.use('/client', clientRouter);



app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
})

module.exports = app;