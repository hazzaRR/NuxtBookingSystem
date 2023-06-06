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

const authenticateEmployee = async (req, res, next) => {

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

    if (user_session.rows[0].user_type !== 'employee') {
        console.log("no here")
        return res.status(403).json({message: "Restricted Access"});
    }
    
    const employee = await pool.query('SELECT * FROM employee WHERE id = $1', [user_session.rows[0].user_id]);

    req.user = employee.rows[0]
    next();

};

router.post("/add-availability", authenticateEmployee, async (req, res) => {

    const user = req.user;
    let {date, slots} = req.body;
    // const user = {
    //     id: 1
    // };

    try {

        console.log(date)
        console.log(slots)


        for (let i = 0; i < slots.length; i++) {

            const availability = await pool.query("INSERT INTO employee_availability (employeeID, AvailabilityDate, StartTime, EndTime, available) VALUES($1, $2, $3, $4, $5) RETURNING *", [user.id, date, slots[i].startTime, slots[i].endTime, true]);

        };

        res.json({message: "Availability Successfully added"});

    } catch (err) {
        console.error(err.message);
        res.json({message:"Error creating user"});
    }

});
    

module.exports = router;