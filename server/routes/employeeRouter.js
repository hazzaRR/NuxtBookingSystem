const express = require('express');
const cors = require("cors");
const pool = require("../db");
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require("crypto-js");
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const app = require('../app');
const port = process.env.PORT || 5001;
require('dotenv').config();


const router = express.Router();

router.use(cookieParser());
router.use(express.json());

const authenticateEmployee = async (req, res, next) => {

    const {auth_token} = req.cookies;

    if (!auth_token) {

        return res.status(401).json({message: "Unable to authenticate session"});
    }


    try {
        
        
        const user_session = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [auth_token]);
        
        
        if (!user_session.rows[0]) {
            return res.status(403).json({message: "Unable to authenticate session"});
        }
        
        // console.log(user_session.rows[0])
        
    if (user_session.rows[0].user_type !== 'employee') {
        return res.status(403).json({message: "Restricted Access"});
    }
    
    const employee = await pool.query('SELECT * FROM employee WHERE id = $1', [user_session.rows[0].user_id]);
    
    // console.log(employee.rows[0]);
    
    req.user = employee.rows[0]
    next();
    
} catch (error) {
    console.log(error.message);
}
};


const reauthenticateEmployee = async (req, res, next) => {

    const {user} = req;
    const { password } = req.body;

    if (!password) {
        return res.status(403).json({message:"No password provided"});
    }

    //find user in the databse and return their details
    const info = await pool.query('SELECT * FROM employee WHERE id = $1', [user.id])

    //check the password the user provided matches their stored password, if they don't return
    //unauthorised code to user, if it is continue with server change
    const isPasswordValid = await bcrypt.compare(password, info.rows[0].password);
    if (isPasswordValid) {
        next();
    } else {
        console.log("incorrect password");
        return res.status(401).json({message:'Invalid password'});
    }

};

const validate_csrfToken = async (req, res, next) => {

    const  csrfToken = req.get('X-CSRF-Token');
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
            const storedCsrfToken = await pool.query('SELECT csrf_token FROM user_sessions WHERE session_id = $1', [auth_token]);

            if (csrfToken === storedCsrfToken.rows[0].csrf_token) {
                console.log("success!")
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

router.get('/account-details', authenticateEmployee, async(req, res) => {
    const user = req.user;

    try {

        const account = await pool.query("SELECT id, email, firstname, surname, telephone from employee WHERE ID = $1", [user.id]);

        const decryptedEmail  = CryptoJS.AES.decrypt(account.rows[0].email, crykey,{ iv: iv });
        account.rows[0].email = decryptedEmail.toString(CryptoJS.enc.Utf8);

        res.json({message: "Successfully fetched account details", account: account.rows[0]});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error getting user"});
    }

});

router.put("/update-availability", authenticateEmployee, validate_csrfToken, async (req, res) => {

    const user = req.user;
    let {availability} = req.body;
    try {
        for (let i = 0; i < availability.length; i++) {

            if (availability[i].available === false) {

                const updateAvail = await pool.query("UPDATE employee_availability SET starttime = $1, endtime = $2, available = $3 WHERE employeeid = $4 AND DayOfWeek = $5", [null, null, availability[i].available, user.id, availability[i].dayofweek]);
            }
            else {
                const updateAvail = await pool.query("UPDATE employee_availability SET starttime = $1, endtime = $2, available = $3 WHERE employeeid = $4 AND DayOfWeek = $5", [availability[i].starttime, availability[i].endtime, availability[i].available, user.id, availability[i].dayofweek]);
            }
            
        };

        return res.json({message: "Availability Successfully added"});

    } catch (err) {
        console.error(err);

        return res.status(500).json({message:"Error creating user"});
    }

});

router.delete('/delete-account', authenticateEmployee, reauthenticateEmployee, validate_csrfToken, async (req, res) => {

    const user = req.user;

    try {

        const deleteAccount = await pool.query("DELETE FROM employee WHERE ID = $1", [user.id]);

        res.json({message: "Employee Successfully Deleted"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error deleting employee"});
    }
});

router.put('/update-account', authenticateEmployee, validate_csrfToken, async (req, res) => {

    const user = req.user;

    const { firstname, surname, telephone } = req.body;

    try {

        const updateAccount = await pool.query("UPDATE employee SET firstname = $1, surname = $2, telephone = $3 WHERE ID = $4", [firstname, surname, telephone, user.id]);

        res.json({message: "Employee details successfully updated"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error update employee"});
    }
});

router.put('/update-password', authenticateEmployee, reauthenticateEmployee, validate_csrfToken, async (req, res) => {


    try {

        const user = req.user;
        let accountid = user.id;
        let {newPassword, reEnteredNewPassword} = req.body;

        if (newPassword !== reEnteredNewPassword) {
            return res.status(403).json({message:"Password do not match"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //find user in database with that id and update their  password
        const updatedAccount = await pool.query(`UPDATE employee SET password = $1 WHERE ID = $2`, [hashedPassword, accountid]);

        console.log("Account password successfully updated");
        res.json({message:"Account password successfully updated"})

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error updating employee password"});
    }
});

router.put('/update-email', authenticateEmployee, reauthenticateEmployee, validate_csrfToken, async (req, res) => {


    try {

        const user = req.user;
        let accountid = user.id;
        let {email} = req.body;

        console.log(email)

        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        //find user in database with that id and update their  password
        const updatedAccount = await pool.query(`UPDATE employee SET email = $1 WHERE ID = $2`, [hashEmail, accountid]);

        console.log("Account email successfully updated");
        res.json({message: "Account email successfully updated"})

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error updating employee password"});
    }
});

router.get('/appointments', authenticateEmployee, async(req, res) => {

    try {

        const user = req.user;

        const appointments = await pool.query("SELECT appointment.id, CAST(appointment.appDate AS TEXT), appointment.StartTime, appointment.EndTime, client.firstname, client.surname, client.telephone, serviceName, service.price FROM Appointment INNER JOIN client ON appointment.clientID = client.id INNER JOIN service ON appointment.serviceID = service.id INNER JOIN employee ON appointment.employeeID = employee.id WHERE employee.id = $1", [user.id]);

        return res.json({message: "Success fetching appointments", appointments:appointments.rows})
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }

});

router.get('/availability', authenticateEmployee, async(req, res) => {

    try {

        const user = req.user;

        const { date } = req.query;

        const availability = await pool.query("SELECT employee_availability.DayOfWeek, employee_availability.StartTime, employee_availability.EndTime, employee_availability.available FROM employee_availability WHERE employee_availability.employeeId = $1", [user.id]);

        return res.json({message: "Success fetching current availability", availability:availability.rows})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error fetching data from database"});
    }

});

router.get('/appointment', authenticateEmployee, async(req, res) => {

    try {

        const user = req.user;
        const { id } = req.query;

        const appointment = await pool.query("SELECT appointment.id, CAST(appointment.appDate AS TEXT), appointment.StartTime, appointment.EndTime, client.firstname, client.surname, client.telephone, service.id as serviceID, service.price FROM Appointment INNER JOIN client ON appointment.clientID = client.id INNER JOIN service ON appointment.serviceID = service.id INNER JOIN employee ON appointment.employeeID = employee.id WHERE appointment.id = $1", [id]);

        console.log(appointment.rows[0])

        return res.json({message: "Success fetching appointment", appointment:appointment.rows[0]})
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }

});

router.put('/appointment', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { id } = req.query;
        const {appDate, startTime, endTime, serviceid} = req.body;

        // console.log(appDate);
        // console.log(startTime);
        // console.log(endTime);
        // console.log(serviceid);

        const appointment = await pool.query("UPDATE appointment SET appdate = $1, starttime = $2, endtime = $3, serviceid = $4 WHERE id = $5", [appDate, startTime, endTime, serviceid, id]);

        return res.json({message: "Success updating appointment"})
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }

});

router.delete('/appointment', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { id } = req.query;

        const appointment = await pool.query("DELETE FROM appointment WHERE id = $1", [id]);

        return res.json({message: "Success deleting appointment"});
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }

});

router.get('/block-days', authenticateEmployee, async(req, res) => {

    try {

        const user = req.user;

        const blockedDays = await pool.query("SELECT id, CAST(blockedDate AS TEXT) from employee_blocked_days WHERE employeeid = $1 AND blockedDate >= $2", [user.id, new Date()]);

        return res.json({message: "Date successfully blocked from employee's availability", blockedDays: blockedDays.rows});
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }


});

router.post('/block-day', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { date } = req.body;

        const blockedDay = await pool.query("INSERT INTO employee_blocked_days (employeeid, blockedDate) VALUES ($1, $2)", [user.id, date]);

        return res.json({message: "Date successfully blocked from employee's availability"});
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }


});

router.delete('/block-day', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { date } = req.body;

        const blockedDay = await pool.query("DELETE FROM employee_blocked_days WHERE employeeid = $1 AND BlockedDate = $2", [user.id, date]);

        return res.json({message: "Blocked day successfully removed"});
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }


});

router.get('/adjust-day', authenticateEmployee, async(req, res) => {

    try {

        const user = req.user;

        const adjusted_availability = await pool.query("SELECT id, CAST(AdjustedDate AS TEXT), starttime, endtime from employee_one_off_availability WHERE employeeid = $1 AND AdjustedDate >= $2", [user.id, new Date()]);

        return res.json({message: "Adjusted availability dates sucessfully fetched", adjusted_availability: adjusted_availability.rows});
        
    } catch (error) {
        return res.json({message: "Error fetching data from database"});
    }


});

router.post('/adjust-day', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { date, starttime, endtime } = req.body;

        const already_exists = await pool.query("SELECT * FROM employee_blocked_days WHERE employeeid = $1 and blockedDate = $2", [user.id, date]);

        if (already_exists.rowCount > 0) {
            return res.status(409).json({message: "Date selected has already been blocked from your availability"})
        }

        const adjusted_availability = await pool.query("INSERT INTO employee_one_off_availability (employeeid, AdjustedDate, starttime, endtime) VALUES ($1, $2, $3, $4)", [user.id, date, starttime, endtime]);

        return res.json({message: "Date successfully adjusted for employee's availability"});
        
    } catch (error) {
        console.log(error);

        if (error.code === '23505') {
            return res.status(409).json({message: "Date selected has already been adjusted, please edit the date using the table"})

        }
        else {
            return res.json({message: "Error fetching data from database"});
        }
    }


});

router.put('/adjust-day', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { date, starttime, endtime, id } = req.body;

        const adjusted_availability = await pool.query("UPDATE employee_one_off_availability SET AdjustedDate = $1, starttime = $2, endtime = $3 WHERE id = $4", [date, starttime, endtime, id]);

        return res.json({message: "Date successfully adjusted for employee's availability"});
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }


});

router.delete('/adjust-day', authenticateEmployee, validate_csrfToken, async(req, res) => {

    try {

        const user = req.user;
        const { date } = req.body;

        const adjusted_availability = await pool.query("DELETE FROM employee_one_off_availability WHERE employeeid = $1 AND AdjustedDate = $2", [user.id, date]);

        return res.json({message: "Adjusted day successfully removed"});
        
    } catch (error) {
        console.log(error)
        return res.json({message: "Error fetching data from database"});
    }


});



    

module.exports = router;