const express = require('express');
const app = express();
const cors = require("cors");
const pool = require("./db");
const jwt = require('jsonwebtoken');
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
// app.use(express.static('public'));


app.get('/set-cookie', (req, res) => {
    // Set the cookie
    res.cookie('cookieName', 'cookieValue', { maxAge: 3600000, httpOnly: true });
  
    console.log(req.cookies);
    // Send a response
    return res.json({message:'Cookie set successfully'});

  });


app.get('/auth-check', async (req, res) => {

    const token = req.cookies.auth_token;

    console.log(token)


    if (!token) {
        console.log("here")
        res.status(403).json({message: false});
    }
    else{
        res.status(200).json({message: true});
    }
});



app.post("/register", async (req, res) => {

    try {
        let {username, email, password} = req.body;

        console.log(username);

        //Returns random delay to combat against account enuneration
        // await delay(500, 1500);


        // Encrypts personal details with cryptojs
        const hashEmail = CryptoJS.AES.encrypt(email, crykey,{ iv: iv }).toString();
        const hashUser = CryptoJS.AES.encrypt(username, crykey,{ iv: iv }).toString();
        


        // Searches into database based on username and email and returns status code if existing user already exists
        const existingUser = await pool.query("SELECT * FROM account WHERE username = $1 OR email = $2", [hashUser,hashEmail]);
        if(existingUser.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }

        //Hashes password and inserts into database, if any error in inserting then register invalid is returned.
        const hashedPassword = await bcrypt.hash(password, 10);
        const account = await pool.query("INSERT INTO account (username,email,password) VALUES($1, $2, $3) RETURNING *", [hashUser,hashEmail,hashedPassword]);
        const info = await pool.query('SELECT * FROM account WHERE username = $1', [hashUser])
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Register Invalid' });
        }
        // Generates token based on account details and then encrypts it with an expiry while generating a csrf token additionally
        const token = jwt.sign({ id: info.rows[0].id,username:username}, process.env.SECRET_KEY, {expiresIn: '2h'});
        // const csrfToken = await generateCsrfToken(token);

        console.log(token);

        res.cookie('auth_token', token, { maxAge: 10 * 60 * 1000, httpOnly: true, secure: true}); // Set cookie to expire in 10 minutes


        res.status(200).json({ success: true, message: 'New user saved successfully' });

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

        const info = await pool.query('SELECT * FROM account WHERE email = $1', [hashEmail])

        //Returns random delay to combat against account enuneration but is rarely needed for validate_auth_request filtering through also having delay
        // await delay(500, 1500);
        // console.log('here')
        if(!info.rows[0]){
            return res.status(409).json({ message: 'Error with authentication' });
        }

        currentTime = new Date();

        //if account is locked and still has cool down period left tell user how long they have left until they can
        //attempt to log in again
        if (info.rows[0].locked && (info.rows[0].locked_until > currentTime)) {
            const remainingTime = Math.ceil((info.rows[0].locked_until - currentTime) / 1000 / 60);
            return res.status(401).json({ message: `Account locked. Please try again in ${remainingTime} minutes.` });
        }
        //if account is locked and time is up unlock account and reset attempt counter
        if (info.rows[0].locked && info.rows[0].locked_until <= currentTime) {
            await pool.query('UPDATE account SET incorrect_attempts = 0, locked = false, locked_until = NULL WHERE email = $1', [hashEmail]);
        }

        
        const isPasswordValid = await bcrypt.compare(password, info.rows[0].password);
        // console.log(isPasswordValid)
        if (!isPasswordValid) {

            if ((info.rows[0].incorrect_attempts) >= 5 && !info.rows[0].locked) {
                await pool.query('UPDATE account SET locked = true, locked_until = NOW() + INTERVAL \'30 minutes\' WHERE email = $1', [hashEmail]);
                return res.status(401).json({ message: 'Account locked. Please try again in 30 minutes' });
            }
            else if ((info.rows[0].incorrect_attempts) < 5 && !info.rows[0].locked) {
                await pool.query('UPDATE account SET incorrect_attempts = $1 WHERE email = $2', [(info.rows[0].incorrect_attempts+1), hashEmail]);
            }

            return res.status(409).json({ message: 'Error with authentication' });
        }

        //if password was correct reset attempt count to 0
        if (info.rows[0].incorrect_attempts !== 0) {
            await pool.query('UPDATE account SET incorrect_attempts = 0 WHERE email = $1', [hashEmail]);
        }


        // decrypts username for token reasons and then attaches to cookie
        const bytes  = CryptoJS.AES.decrypt(info.rows[0].username, crykey,{ iv: iv });
        const unHashUser = bytes.toString(CryptoJS.enc.Utf8);
        const token = jwt.sign({ id: info.rows[0].id,username:unHashUser}, process.env.SECRET_KEY, {expiresIn: '2h'});

        console.log(token);

        res.cookie('auth_token', token, { maxAge: 10 * 60 * 1000, httpOnly: true, secure: true}); // Set cookie to expire in 10 minutes
        res.json({ message: 'Log in successful' });

        // const csrfToken = await generateCsrfToken(token);
        // if (csrfToken.code === 200) {
        //     res.cookie('token', token, { maxAge: 10 * 60 * 1000, httpOnly:true, secure:true}); // Set cookie to expire in 10 minutes
        //     res.json({ message: 'Worked' });
        // }
        // else {
        //     console.log("CSRF Token failed to be generated")
        //     res.status(402).json({ message: 'Invalid token' });
        // }

    } catch (err) {
        console.log(err);
        res.json({ message: 'Ahh error happened'})
    }
});


app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
})

module.exports = app;