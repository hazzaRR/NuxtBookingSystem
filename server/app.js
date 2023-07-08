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
        return res.status(401).json({message: "Unable to authenticate session"});
    }

    const user_session = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [auth_token]);

    if (user_session.rowCount === 0) {
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

const validate_csrfToken = async (req, res, next) => {

    const {csrfToken} = req.body;
    console.log(csrfToken);

    // if no sessionID is provided return unauthorised status, if there is no crsftoken provided return forbidden status code
    if (!csrfToken) {
        console.log("No csrf token provided");
        return res.status(403).json({ message: 'No csrf token provided'});
    }
    else {
        // if session id and csrftoken is provided check for session id in database and retrieve csrftoken provided with it
        // if they match perform rest of api action
        try {
            const {auth_token} = req.cookies;
            // console.log(sessionID);
            const storedCsrfToken = await pool.query('SELECT csrf_token FROM user_sessions WHERE session_id = $1', [auth_token])

            if (csrfToken === storedCsrfToken.rows[0].csrf_token) {
                next();

                // else return forbidden status saying token is invalid
            } else {
                console.log('Invalid CSRF token');
                return res.status(403).json({message:'Invalid CSRF token'});
            }
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message:'Error validating CSRF token'});
        }
    }
};

app.get("/csrf-token", async (req, res) => {

    try {
        //find csrf token for the given session and return it to client frontend
        const {auth_token} = req.cookies;
        const storedCsrfToken = await pool.query('SELECT csrf_token FROM user_sessions WHERE session_id = $1', [auth_token]);

        console.log(storedCsrfToken.rows[0].csrf_token);

        return res.json({ message: "CSRF TOKEN fetched successfully", csrf_token: storedCsrfToken.rows[0].csrf_token});

    } catch (err) {
        console.error(err)
        return res.status(500).json({message:'Error fetching CSRF token'});
    }

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
            console.log("This one")
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
        res.json({ message: 'Registration successful', user_type: createSession.rows[0].user_type });

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error creating user"});
    }

});

app.post("/login", async (req, res) => {

    let {email,password} = req.body;

    console.log(email)

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

        const getServices = await pool.query("SELECT * FROM service ORDER BY servicename ASC");


        return res.json({message:"Services fetched successfully", services: getServices.rows})
        
    } catch (error) {
        return res.status(500).json({message:"Error accessing database"});
    }
});

app.get("/available-employees", async (req, res) => {


    try {

        
        const {date} = req.query;
        
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

        const dateToFind = new Date(date);

        const getEmployees = await pool.query(`SELECT DISTINCT employee.id, employee.firstname, employee.surname FROM employee
         INNER JOIN employee_availability ON employee_availability.employeeid = employee.id
          LEFT JOIN employee_blocked_days ON employee_blocked_days.employeeid = employee.id AND employee_blocked_days.blockedDate = $1
           WHERE employee_availability.DayOfWeek = $2 AND employee_availability.available = $3
           AND employee_blocked_days.employeeid IS NULL`, [dateToFind, weekday[dateToFind.getDay()], true]);

        console.log(getEmployees.rows)
        return res.json({message:"Employees Successfully fetched", employees: getEmployees.rows})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error accessing database"});
    }
});

// app.get("/available-slots", async (req, res) => {


//     try {

//         const {date, id} = req.query;

//         const getAvailability = await pool.query("SELECT employee_availability.starttime, employee_availability.endtime FROM employee_availability INNER JOIN employee ON employee_availability.employeeid = employee.id WHERE employee_availability.AvailabilityDate = $1 AND employee_availability.employeeid = $2 AND employee_availability.available = $3", [date, id, true]);


//         return res.json({message:"Slots fetched successfully", availability: getAvailability.rows})
        
//     } catch (error) {
//         return res.status(500).json({message:"Error accessing database"});
//     }
// });

app.get("/available-slots", async (req, res) => {


    try {

        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

        const {date, id, duration} = req.query;

        const dateToFind = new Date(date);

        const checkIfBlocked = await pool.query("SELECT * FROM employee_blocked_days WHERE employeeID = $1 AND blockedDate = $2", [id, dateToFind]);

        if (checkIfBlocked.rowCount > 0) {
            return res.status(204).json({message: "No availability for that day", availability: []});
        }

        let getAvailability; 

        getAvailability = await pool.query('SELECT StartTime, EndTime FROM employee_one_off_availability WHERE EmployeeID = $1 AND AdjustedDate = $2', [id, date]);

        if (getAvailability.rowCount === 0) {
            getAvailability = await pool.query('SELECT StartTime, EndTime, available FROM employee_availability WHERE EmployeeID = $1 AND DayOfWeek = $2', [id, weekday[dateToFind.getDay()]]);

            
            if (!getAvailability.rows[0].available) {
                return res.status(204).json({message: "No availability for that day", availability: []});
            }
        };


        const availabilityRows = getAvailability.rows;

        console.log(availabilityRows);

        const appointmentQuery = await pool.query('SELECT StartTime, EndTime FROM appointment WHERE employeeID = $1 AND appDate = $2', [id, dateToFind]);

        const appointmentsRows = appointmentQuery.rows;

        // console.log(appointmentsRows);

        // Generate the available time slots with 15-minute intervals
        const availableTimeSlots = [];
        for (const { starttime, endtime } of availabilityRows) {
            const slotStartTime = new Date(`${date} ${starttime}`);
            const slotEndTime = new Date(`${date} ${endtime}`);

            // Generate slots with 15-minute intervals
            let currentSlotTime = new Date(slotStartTime);
            while (currentSlotTime < slotEndTime) {
                const slotEndTime = new Date(currentSlotTime);
                slotEndTime.setMinutes(currentSlotTime.getMinutes() + parseInt(duration));
                console.log(currentSlotTime, slotEndTime);

            // Check if the slot overlaps with any booked appointments
            let slotOverlaps = false;
            for (const { starttime, endtime } of appointmentsRows) {
                const appointmentStartTime = new Date(`${date} ${starttime}`);
                const appointmentEndTime = new Date(`${date} ${endtime}`);

                if (
                (currentSlotTime >= appointmentStartTime && currentSlotTime < appointmentEndTime) ||
                (slotEndTime > appointmentStartTime && slotEndTime <= appointmentEndTime) ||
                (currentSlotTime <= appointmentStartTime && slotEndTime >= appointmentEndTime)
                ) {
                    console.log(currentSlotTime);
                slotOverlaps = true;
                break;
                }
            }

            // Add the slot to the availableTimeSlots array if it doesn't overlap with any booked appointments
            if (!slotOverlaps) {

            availableTimeSlots.push({
                startTime: currentSlotTime.toLocaleTimeString(),
                });
            }

            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + 15);
            }
        }

        console.log(availableTimeSlots);

        return res.json({message:"Slots fetched successfully", availability: availableTimeSlots});
        
    } catch (error) {
        console.log(error);
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