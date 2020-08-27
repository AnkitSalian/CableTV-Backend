const mysql = require('mysql');

const connectDB = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE
    });

    await connection.connect((err) => {
        if (err) {
            console.log(`Error connecting MySQL: ${err}`.red.underline.bold);
        }
        else {
            console.log(`MySQL connected`.cyan.underline.bold);
        }
    })

    return connection;

}

module.exports = connectDB;


