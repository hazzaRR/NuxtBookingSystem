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

const authenticateAdmin = async (req, res, next) => {

    const {auth_token} = req.cookies;

    console.log(auth_token)

    if (!auth_token) {

        return res.status(401).json({message: "Unable to authenticate session"});
    }

    const user_session = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [auth_token]);

    
    if (!user_session.rows[0]) {
        return res.status(403).json({message: "Unable to authenticate session"});
    }

    console.log(user_session.rows[0])

    if (user_session.rows[0].user_type !== 'admin') {
        return res.status(403).json({message: "Restricted Access"});
    }
    
    const admin = await pool.query('SELECT * FROM admin WHERE id = $1', [user_session.rows[0].user_id]);

    req.user = admin.rows[0]
    next();

};

const reauthenticateAdmin = async (req, res, next) => {

    const { user } = req;

    const adminID = user.id;

    const { password } = req.body;
    // const hashUsername = CryptoJS.AES.encrypt(username, crykey,{ iv: iv }).toString();
    //find user in the databse and return their details
    const info = await pool.query('SELECT * FROM admin WHERE id = $1', [adminID])

    console.log(info.rows[0])

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

router.get('/employees', authenticateAdmin, async (req, res) => {

    try {

        console.log("This got here")

        const employees = await pool.query('SELECT id, firstname, surname, telephone FROM employee');

        console.log(employees.rows);

        return res.status(200).json({employees: employees.rows, message: "Employees fetched succesfully"});
        
    } catch (err) {
        console.error(err.message);
        res.json({ message:"Error fetching employees" });
    }


});

router.put('/change-password', authenticateAdmin, reauthenticateAdmin, async (req, res) => {

    try {

        const user = req.user;
        let accountid = user.id;
        let {newPassword, reEnteredNewPassword} = req.body;

        if (newPassword !== reEnteredNewPassword) {
            return res.status(403).json("Password do not match");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //find user in database with that id and update their  password
        const updatedAccount = await pool.query(`UPDATE admin SET password = $1 WHERE ID = $2`, [hashedPassword, accountid]);

        console.log("Account password successfully updated");
        return res.json("Account password successfully updated")

    } catch (err) {
        console.error(err.message);
        return res.json({ message:"Error updating admin password" });
    }
});

router.post('/register-employee', authenticateAdmin, async (req, res) => {


    try {
        let {email, password, firstname, surname} = req.body;

        // Encrypts personal details with cryptojs
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        
        // Searches into database based on username and email and returns status code if existing user already exists
        const existingUser = await pool.query("SELECT * FROM client WHERE email = $1 UNION SELECT * FROM employee WHERE email = $1", [hashEmail]);
        if(existingUser.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }

        //Hashes password and inserts into database, if any error in inserting then register invalid is returned.
        const hashedPassword = await bcrypt.hash(password, 10);
        const account = await pool.query("INSERT INTO employee (email, password, firstname, surname) VALUES($1, $2, $3, $4) RETURNING *", [hashEmail, hashedPassword, firstname, surname]);
        const info = await pool.query('SELECT * FROM employee WHERE email = $1', [hashEmail])
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }


        res.json({ message: 'Employee Successfully registered', user_type: createSession.rows[0].user_type});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error creating employee"});
    }

});

router.delete('/delete-employee', authenticateAdmin, async (req, res) => {

    const {employeeId} = req.body;

    try {

        const deleteAccount = await pool.query("DELETE FROM employee WHERE ID = $1", [employeeId]);

        res.json({message: "Employee Successfully Deleted"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error deleting employee"});
    }
});

router.post('/add-service', authenticateAdmin, async (req, res) => {

    try {

        const {servicename, price} = req.body;


        const addService = await pool.query('INSERT into service (servicename, price) VALUES ($1, $2)', [servicename, price]);


        return res.json({message: "Service added succesfully"});
        
    } catch (error) {
        
        return res.status(500).json({message: "Error accessing database"});
    }


});

router.delete('/delete-service', authenticateAdmin, async (req, res) => {

    try {

        const {id} = req.body;


        const deleteService = await pool.query('DELETE from service WHERE id = $1', [id]);


        return res.json({message: "Service deleted succesfully"});
        
    } catch (error) {
        
        return res.status(500).json({message: "Error accessing database"});
    }


});

router.put('update-service', authenticateAdmin, async (req, res) => {

    try {

        const {id, servicename, price} = req.body;


        const updateService = await pool.query('UPDATE service set service name = $1, price = $2 WHERE id = $3', [servicename, price, id]);


        return res.json({message: "Service deleted succesfully"});
        
    } catch (error) {
        
        return res.status(500).json({message: "Error accessing database"});
    }



});


    

module.exports = router;