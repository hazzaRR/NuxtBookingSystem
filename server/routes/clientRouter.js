const express = require('express');
const cors = require("cors");
const pool = require("../db");
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require("crypto-js");
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5001;
require('dotenv').config();


const router = express.Router();

router.use(cookieParser());
router.use(express.json());

const authenticateClient = async (req, res, next) => {

    const {auth_token} = req.cookies;

    if (!auth_token) {

        return res.status(401).json({message: "Unable to authenticate session"});
    }

    const user_session = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [auth_token]);

    
    if (!user_session.rows[0]) {
        console.log("here")
        return res.status(403).json({message: "Unable to authenticate session"});
    }

    console.log(user_session.rows[0])

    if (user_session.rows[0].user_type !== 'client') {
        return res.status(403).json({message: "Restricted Access"});
    }
    
    const client = await pool.query('SELECT * FROM client WHERE id = $1', [user_session.rows[0].user_id]);

    req.user = client.rows[0]
    next();

};

const reauthenticateClient = async (req, res, next) => {

    const user = req.user;

    const { password } = req.body;


    //find user in the databse and return their details
    const info = await pool.query('SELECT * FROM client WHERE id = $1', [user.id])

    //check the password the user provided matches their stored password, if they don't return
    //unauthorised code to user, if it is continue with server change
    const isPasswordValid = await bcrypt.compare(password, info.rows[0].password);
    if (isPasswordValid) {
        next();
    } else {
        res.status(401).json('Invalid password');
        console.log("incorrect password");
    }

};

router.get('/account-details', authenticateClient, async(req, res) => {
    const user = req.user;

    try {

        const account = await pool.query("SELECT id, email, firstname, surname, telephone from client WHERE ID = $1", [user.id]);

        const decryptedEmail  = CryptoJS.AES.decrypt(account.rows[0].email, crykey,{ iv: iv });
        account.rows[0].email = decryptedEmail.toString(CryptoJS.enc.Utf8);

        res.json({message: "Successfully fetched account details", account: account.rows[0]});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error getting user"});
    }

});

router.delete('/delete-account', authenticateClient, reauthenticateClient, async (req, res) => {

    const user = req.user;

    try {

        const deleteAccount = await pool.query("DELETE FROM client WHERE ID = $1", [user.id]);

        res.json({message: "Client Successfully Deleted"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error deleting Client"});
    }
})

router.put('/update-account', authenticateClient, authenticateClient, async (req, res) => {

    const user = req.user;

    const {firstname, surname, telephone} = req.body;

    try {

        const updateAccount = await pool.query("UPDATE client SET firstname = $1, surname = $2, telephone = $3 WHERE ID = $4", [firstname, surname, telephone, user.id]);

        res.json({message: "Client details successfully updated"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error deleting employee"});
    }
});

router.put('/update-password', authenticateClient, reauthenticateClient, async (req, res) => {


    try {

        const user = req.user;
        let accountid = user.id;
        let {newPassword, reEnteredNewPassword} = req.body;

        if (newPassword !== reEnteredNewPassword) {
            return res.status(403).json({message:"Password do not match"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //find user in database with that id and update their  password
        const updatedAccount = await pool.query(`UPDATE client SET password = $1 WHERE ID = $2`, [hashedPassword, accountid]);

        console.log("Account password successfully updated");
        res.json({message:"Account password successfully updated"})

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error updating employee password"});
    }
});

router.put('/update-email', authenticateClient, reauthenticateClient, async (req, res) => {


    try {

        const user = req.user;
        let accountid = user.id;
        let {email} = req.body;

        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        //find user in database with that id and update their  password
        const updatedAccount = await pool.query(`UPDATE client SET email = $1 WHERE ID = $2`, [hashEmail, accountid]);

        console.log("Account email successfully updated");
        res.json({message: "Account email successfully updated"})

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error updating employee password"});
    }
});

router.get('/appointments', authenticateClient, async (req, res) => {

    try {

        const user = req.user;

        const appointments = await pool.query("SELECT appointment.id, CAST(appointment.appDate AS TEXT), starttime, endtime, employee.firstname, employee.surname, service.servicename, service.price FROM appointment INNER JOIN employee ON appointment.employeeid = employee.id INNER JOIN client ON appointment.clientid = client.id INNER JOIN service ON appointment.serviceid = service.id WHERE client.id = $1 and appdate >= $2", [user.id, new Date()]);

        console.log(appointments.rows)

        res.json({message: "appointments succssfully fetched", appointments: appointments.rows})

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error fetching from server"});
    }



});

router.delete('/appointment', authenticateClient, async (req, res) => {

    try {

        const user = req.user;

        const {id} = req.query;

        const appointment = await pool.query("DELETE FROM appointment WHERE id = $1 RETURNING CAST(appDate AS TEXT), starttime, endtime, employeeid", [id]);

        const updateAvailabilty = await pool.query("UPDATE employee_availability SET available = $1 WHERE availabilitydate = $2 AND starttime = $3 AND endtime = $4 AND employeeid = $5 RETURNING *", [true, appointment.rows[0].appdate, appointment.rows[0].starttime, appointment.rows[0].endtime, appointment.rows[0].employeeid]);


        if (updateAvailabilty.rowCount === 0) {
            const createAvailabilty = await pool.query("INSERT INTO employee_availability (employeeID, AvailabilityDate, StartTime, EndTime, available) VALUES($1, $2, $3, $4, $5)", [appointment.rows[0].employeeid, appointment.rows[0].appdate, appointment.rows[0].starttime, appointment.rows[0].endtime, true]);
        }

        res.json({message: "Appointment Cancelled"});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error fetching from server"});
    }



});


    

module.exports = router;