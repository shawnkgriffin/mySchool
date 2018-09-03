require('dotenv').config();

const cw = require('./commandwearAPI.js');

cw.cwLogin(process.env.USER_NAME, process.env.PASSWORD);
