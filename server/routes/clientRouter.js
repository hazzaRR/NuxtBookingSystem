const express = require('express');
const cors = require("cors");
const pool = require("../db");
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require("crypto-js");
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const port = process.env.PORT || 5001;
require('dotenv').config();


const router = express.Router();

router.use(cookieParser());
router.use(express.json());

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

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


const validate_csrfToken = async (req, res, next) => {

    const  csrfToken = req.get('X-CSRF-Token');

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

router.delete('/delete-account', authenticateClient, reauthenticateClient, validate_csrfToken, async (req, res) => {

    const user = req.user;

    try {

        const deleteAccount = await pool.query("DELETE FROM client WHERE ID = $1", [user.id]);

        res.json({message: "Client Successfully Deleted"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error deleting Client"});
    }
})

router.put('/update-account', authenticateClient, authenticateClient, validate_csrfToken, async (req, res) => {

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

router.put('/update-password', authenticateClient, reauthenticateClient, validate_csrfToken, async (req, res) => {


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

router.put('/update-email', authenticateClient, reauthenticateClient, validate_csrfToken, async (req, res) => {


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

router.get('/upcoming-appointments', authenticateClient, async (req, res) => {

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

router.get('/previous-appointments', authenticateClient, async (req, res) => {

    try {

        const user = req.user;

        const appointments = await pool.query("SELECT appointment.id, CAST(appointment.appDate AS TEXT), starttime, endtime, employee.firstname, employee.surname, service.servicename, service.price FROM appointment INNER JOIN employee ON appointment.employeeid = employee.id INNER JOIN client ON appointment.clientid = client.id INNER JOIN service ON appointment.serviceid = service.id WHERE client.id = $1 and appdate < $2", [user.id, new Date()]);

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

        
        res.json({message: "Appointment Cancelled"});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error fetching from server"});
    }



});

router.post("/book-slot", authenticateClient, validate_csrfToken, async (req, res) => {


    try {

        const user = req.user;

        const {date, employeeID, serviceID, slot, duration} = req.body;

        console.log(user.id)
        console.log(date)
        console.log(employeeID)
        console.log(serviceID)
        console.log(slot)

        const slotEndTime = new Date(`${date} ${slot}`);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + parseInt(duration));

        const bookSlot = await pool.query("INSERT INTO appointment (appDate, starttime, endtime, employeeID, serviceID, clientID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [date, slot, slotEndTime.toLocaleTimeString(), employeeID, serviceID, user.id]);

        let decryptedEmail = CryptoJS.AES.decrypt(user.email, crykey,{ iv: iv });


        // const bookingDetails = await pool.query("SELECT employee.firstname, employee.surname, service.servicename, appointment.starttime FROM appointment INNER JOIN employee ON appointment.employeeid = employee.id INNER JOIN service ON appointment.serviceid = service.id WHERE appointment.id = $1", [bookSlot.rows[0].id])


        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: decryptedEmail.toString(CryptoJS.enc.Utf8),
        //     subject: `Booking Confirmation: ${bookingDetails.rows[0].servicename} - ${new Date(date).toLocaleDateString()} - ${slot.slice(0,5)}`,
        //     text: `Hi ${user.firstname} ${user.surname},

        //     Thanks for booking with us!
        //     We're just sending an email to confirm your ${bookingDetails.rows[0].servicename} appointment with ${bookingDetails.rows[0].firstname} ${bookingDetails.rows[0].surname} 
        //     on ${new Date(date).toLocaleDateString()} at ${slot.slice(0,5)}.
            
        //     No shows and cancellations with less than than 24hours notice will incur a fee of 50% of the service. To cancel your booking, visit ${process.env.URL}/cancel, or you can call us on ${process.env.NUMBER}.
            
        //     Thanks,
        //     LB Massages`
        //   };
          
        //   transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //       console.log(error);
        //     } else {
        //       console.log('Email sent: ' + info.response);
        //     }

        //   });

        return res.json({message:"Booking Confirmed", booking: bookSlot.rows[0]})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error accessing database"});
    }
});


    

module.exports = router;