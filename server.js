const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
// const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

//Load enviromnent variables
dotenv.config({ path: './config/config.env' });

//Connect to database
// connectDB();

//Route files
const auth = require('./routes/auth');

const app = express();

//Body Parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Developer loading middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File upload
app.use(fileUpload());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100
})

app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//Set static folder 
//TODO: Add documentation page at the end
// app.use(express.static(path.join(__dirname, 'public')));

//Mount router
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    //Close servers and exit process
    server.close(() => process.exit(1));
})