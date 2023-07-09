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
            .send({email: 'test@email.com', firstname: 'Harry', surname: 'Redman', password: 'testPassword10!', telephone: '07980123456'})
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
            .send({email: 'test@email.com', firstname: 'Harry', surname: 'Redman', password: 'testPassword10!', telephone: '07450678543'})
            .expect(409);
            
            expect(response.body.message).to.equal('Register Invalid');
  
          });

    });

    describe('Registering Employee', () => {
      let testSession = null;
      let csrfToken;
      let sessionID;

      before(async () => {
        testSession = session(app);
        // Generate the current TOTP
        const response = await testSession
        .post('/login')
        .send({ email: 'harryR', password: 'password'})
        .expect(200);
        
        const setCookieHeader = response.headers['set-cookie'];
        sessionID = setCookieHeader.find(cookie => cookie.includes('auth_token='));
        
        csrfToken = await testSession
        .get('/csrf-token')
        .set('Cookie', sessionID)
        .expect(200)
        .then((res) => res.body.csrf_token);
      });

      after(async () => {
        const response = await testSession
        .get('/logout')
        .set('Cookie', sessionID)
        .expect(200)
      });

      it('register a new user', async () => {
      
          const response = await testSession
          .post('/admin/register-employee')
          .set('Cookie', sessionID)
          .set({'X-CSRF-Token': csrfToken})
          .send({email: 'test_employee@email.com', firstname: 'Harry', surname: 'Redman', password: 'testPassword10!', telephone: "07654123321"})
          .expect(200);
          
          expect(response.body.message).to.equal('Employee Successfully registered');

          
          const newUser = await pool.query('SELECT * FROM employee WHERE email = $1', [CryptoJS.AES.encrypt('test_employee@email.com', crykey,{ iv: iv }).toString()]);
          expect(newUser.rows.length).to.equal(1);
          
        
        });

        it('register a new user with the same email', async () => {
      
          const response = await testSession
          .post('/register')
          .set('Cookie', sessionID)
          .set({'X-CSRF-Token': csrfToken})
          .send({email: 'test@email.com', firstname: 'Harry', surname: 'Redman', password: 'testPassword10!', telephone: '07876123456'})
          .expect(409);
          
          expect(response.body.message).to.equal('Register Invalid');

        });

  });

        //test logging into server with a previously created test account made above
    describe('Account Login', () => {
      let testSession = null;
      let csrfToken;
      let sessionID;
      
      it('Unsuccessful Log in, entering incorrect user password', async () => {
        testSession = session(app);
        const response = await testSession
        .post('/login')
        .send({ email: 'test@email.com', password: 'testPassword10'})
        .expect(409);
        
        
        expect(response.body.message).to.equal('Error with authentication');
      });

      it('Unsuccessful Log in, entering email doesn\'t exist', async () => {
        testSession = session(app);
        const response = await testSession
        .post('/login')
        .send({ email: 'test12@email.com', password: 'd10'})
        .expect(409);
        
        
        expect(response.body.message).to.equal('Error with authentication');
      });
      
      it('successful Log in as client', async () => {
        testSession = session(app);
        const response = await testSession
        .post('/login')
        .send({ email: 'test@email.com', password: 'testPassword10!'})
        .expect(200);

        expect(response.body.message).to.equal('Log in successful');
        expect(response.body.user_type).to.equal('client');
        
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

      it('successful Log in as client', async () => {
        testSession = session(app);
        const response = await testSession
        .post('/login')
        .send({ email: 'harryR', password: 'password'})
        .expect(200);

        expect(response.body.message).to.equal('Log in successful');
        expect(response.body.user_type).to.equal('admin');
        
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
    });


    describe('testing auth on admin account', () => {

      let testSession = null;
      let csrfToken;
      let sessionID;

      before(async () => {
      testSession = session(app);
      const response = await testSession
      .post('/login')
      .send({ email: 'harryR', password: 'password'})
      .expect(200);
      
      const setCookieHeader = response.headers['set-cookie'];
      sessionID = setCookieHeader.find(cookie => cookie.includes('auth_token='));
      
      csrfToken = await testSession
      .get('/csrf-token')
      .set('Cookie', sessionID)
      .expect(200)
      .then((res) => res.body.csrf_token);
    });

    after(async () => {
      const response = await testSession
      .get('/logout')
      .set('Cookie', sessionID)
      .expect(200)
    });

    it('successful auth check on admin', async () => {
      testSession = session(app);
      const response = await testSession
      .get('/auth-check')
      .set('Cookie', sessionID)
      .expect(200);

      expect(response.body.message).to.equal("Authenticated");
      expect(response.body.user_type).to.equal('admin');
    

    });

    it('unsuccessful auth check on admin, no auth token', async () => {
      testSession = session(app);
      const response = await testSession
      .get('/auth-check')
      .expect(401);

      expect(response.body.message).to.equal("Unable to authenticate session");
    

    });

    it('unsuccessful auth check on admin, invalid auth token', async () => {
      testSession = session(app);
      const response = await testSession
      .get('/auth-check')
      .set('Cookie', 'auth_token=33fc8d37-bf94-4039-b735-a4a9aec82131')
      .expect(403);

      expect(response.body.message).to.equal("Unable to authenticate session");
    

    });

});

describe('testing auth on client account', () => {

  let testSession = null;
  let csrfToken;
  let sessionID;

  before(async () => {
  testSession = session(app);
  const response = await testSession
  .post('/login')
  .send({ email: 'test@email.com', password: 'testPassword10!'})
  .expect(200);
  
  const setCookieHeader = response.headers['set-cookie'];
  sessionID = setCookieHeader.find(cookie => cookie.includes('auth_token='));
  
  csrfToken = await testSession
  .get('/csrf-token')
  .set('Cookie', sessionID)
  .expect(200)
  .then((res) => res.body.csrf_token);
});

after(async () => {
  const response = await testSession
  .get('/logout')
  .set('Cookie', sessionID)
  .expect(200)
});

it('successful auth check on client', async () => {
  testSession = session(app);
  const response = await testSession
  .get('/auth-check')
  .set('Cookie', sessionID)
  .expect(200);

  expect(response.body.message).to.equal("Authenticated");
  expect(response.body.user_type).to.equal('client');


});

it('unsuccessful auth check on client, no auth token', async () => {
  testSession = session(app);
  const response = await testSession
  .get('/auth-check')
  .expect(401);

  expect(response.body.message).to.equal("Unable to authenticate session");


});

it('unsuccessful auth check on client, invalid auth token', async () => {
  testSession = session(app);
  const response = await testSession
  .get('/auth-check')
  .set('Cookie', 'auth_token=33fc8d37-bf94-4039-b735-a4a9aec82131')
  .expect(403);

  expect(response.body.message).to.equal("Unable to authenticate session");


});

});

describe('testing auth on employee account', () => {

  let testSession = null;
  let csrfToken;
  let sessionID;

  before(async () => {
  testSession = session(app);
  const response = await testSession
  .post('/login')
  .send({ email: 'test_employee@email.com', password: 'testPassword10!'})
  .expect(200);
  
  const setCookieHeader = response.headers['set-cookie'];
  sessionID = setCookieHeader.find(cookie => cookie.includes('auth_token='));
  
  csrfToken = await testSession
  .get('/csrf-token')
  .set('Cookie', sessionID)
  .expect(200)
  .then((res) => res.body.csrf_token);
});

after(async () => {
  const response = await testSession
  .get('/logout')
  .set('Cookie', sessionID)
  .expect(200)
});

it('successful auth check on employee', async () => {
  testSession = session(app);
  const response = await testSession
  .get('/auth-check')
  .set('Cookie', sessionID)
  .expect(200);

  expect(response.body.message).to.equal("Authenticated");
  expect(response.body.user_type).to.equal('employee');


});

it('unsuccessful auth check on employee, no auth token', async () => {
  testSession = session(app);
  const response = await testSession
  .get('/auth-check')
  .expect(401);

  expect(response.body.message).to.equal("Unable to authenticate session");


});

it('unsuccessful auth check on employee, invalid auth token', async () => {
  testSession = session(app);
  const response = await testSession
  .get('/auth-check')
  .set('Cookie', 'auth_token=33fc8d37-bf94-4039-b735-a4a9aec82131')
  .expect(403);

  expect(response.body.message).to.equal("Unable to authenticate session");


});

});

describe('GET /available-employees', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;


  it('should return available employees for a given date', async () => {
    const response = await session(app)
      .get('/available-employees')
      .query({ date: '2023-07-09' }); // Replace with the desired date

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Employees Successfully fetched');
    expect(response.body.employees).to.be.an('array');
  });

});

describe('GET /available-employees', () => {
  let testSession = null;
  let csrfToken;
  let sessionID;


  it('Get /services', async () => {
    const response = await session(app)
      .get('/services')

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Services fetched successfully");
    expect(response.body.services).to.be.an('array');
  });

});

describe('GET /available-slots', () => {
  it('should return available time slots for a given date, employee ID, and duration', async () => {
    const response = await session(app)
      .get('/available-slots')
      .query({ date: '2023-07-08', id: 1, duration: '30' });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Slots fetched successfully');
    expect(response.body.availability).to.be.an('array');
    expect(response.body.availability).to.have.lengthOf(24);
    // Add more assertions to validate the response body or other conditions as needed
  });

  it('should return no availability if the employee is blocked for that day', async () => {
    const response = await session(app)
      .get('/available-slots')
      .query({ date: '2023-07-09', id: 1, duration: '30' }); 

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('No availability for that day');
    expect(response.body.availability).to.be.an('array');
    expect(response.body.availability).to.have.lengthOf(0);
    // Add more assertions to validate the response body or other conditions as needed
  });

  it('should return no availability if the employee has no regular or one-off availability for that day', async () => {
    const response = await session(app)
      .get('/available-slots')
      .query({ date: '2023-07-09', id: 1, duration: '30' });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('No availability for that day');
    expect(response.body.availability).to.be.an('array');
    expect(response.body.availability).to.have.lengthOf(0);
    // Add more assertions to validate the response body or other conditions as needed
  });
});


}