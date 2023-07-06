const chai = require('chai');
const {expect} = chai;
const app = require('../app');
const request = require('supertest')(app);
const session  = require('supertest-session');
const { describe, it } = require('mocha');
const pool = require("../db");
const CryptoJS = require("crypto-js");
require('dotenv').config();
const crykey = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");


if (process.env.DATABASE === 'test') {

    describe('Registering Client', () => {
        let testSession = null;
        let csrfToken;
        let sessionID;
  
        before(async () => {
          testSession = session(app);
        });

        it('register a new user', async () => {
        
            const response = await testSession
            .post('/register')
            .send({email: 'test@email.com', firstname: 'Harry', surname: 'Redman', password: 'testPassword10!', telephone: 'telephone'})
            .expect(200);
            
            expect(response.body.message).to.equal('Registration successful');
  
            
            const newUser = await pool.query('SELECT * FROM client WHERE email = $1', [CryptoJS.AES.encrypt('test@email.com', crykey,{ iv: iv }).toString()]);
            expect(newUser.rows.length).to.equal(1);
            
            const setCookieHeader = response.headers['set-cookie'];
            sessionID = setCookieHeader.find(cookie => cookie.includes('auth_token='));
            
            csrfToken = await testSession
            .get('/csrf-token')
            .set('Cookie', sessionID)
            .expect(200)
            .then((res) => res.body.csrf_token);
  
  
            const logout = await testSession
              .get('/logout')
              .set('Cookie', sessionID)
              .expect(200);
          });

          it('register a new user with the same email', async () => {
        
            const response = await testSession
            .post('/register')
            .send({email: 'test@email.com', firstname: 'Harry', surname: 'Redman', password: 'testPassword10!', telephone: 'telephone'})
            .expect(409);
            
            expect(response.body.message).to.equal('Register Invalid');
  
          });






    });




}