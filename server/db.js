const { Pool } = require('pg');
require('dotenv').config();

let databaseName;
if (process.env.DATABASE === "test") {
    // databaseName = "nuxt_booking_test"
    databaseName = "nuxt_booking"
}
else {
    databaseName = "nuxt_booking"
};
const pool = new Pool ({
    user: "postgres",
    password: process.env.DATABASE_PASSWORD,
    database: databaseName,
    host: "localhost",
    port: 5432
});

pool.connect();

module.exports = pool;