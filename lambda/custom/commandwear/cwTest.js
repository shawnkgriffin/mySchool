require('dotenv').config();

const cw = require('./commandwearAPI.js');

cw.cwLoginPositionEmergency(process.env.USER_NAME, process.env.PASSWORD,
  'Lockdown. 22 kids in class. 2 in library.');
