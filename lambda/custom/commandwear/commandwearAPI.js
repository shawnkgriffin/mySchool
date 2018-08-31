const axios = require('axios');

function csLogout() {
  axios.delete('https://cw-staging-1.herokuapp.com/api/tokens').then((response) => {
    console.log('csLogout', response);
  }).catch((error) => {
    console.log(error);
  });
}

function cwEmergency() {
  axios.post(
    'https://cw-staging-1.herokuapp.com/api/emergency_states',
  ).then((response) => {
    console.log('cwEmergency', response);
  }).catch((error) => {
    console.log(error);
  });
}
function cwPosition(latitude, longitude) {
  axios.post(
    'https://cw-staging-1.herokuapp.com/api/positions',
    {
      position:
      {
        latitude,
        longitude,
        accuracy: 30,
        recorded_at: '2018-08-30T20:23:53.929Z',
      },
    },
  ).then((response) => {
    console.log('cwPosition', response);
    cwEmergency();
  }).catch((error) => {
    console.log(error);
  });
}
function cwLogin(username, password) {
  axios.post('https://cw-staging-1.herokuapp.com/api/tokens', {
    username,
    password,
  })
    .then((response) => {
      console.log('csLogin', response, response.data.token);
      axios.defaults.headers.common = { Authorization: `Token token=${response.data.token}` };

      cwPosition(49.278368, -123.106782);
    })
    .catch((error) => {
      console.log(error);
    });
}

module.exports = {

  cwLogin,
  cwEmergency,
  cwPosition,
};
