const axios = require('axios');

function csLogout() {
  axios.delete('https://cw-staging-1.herokuapp.com/api/tokens').then((response) => {
    console.log('csLogout', response);
  }).catch((error) => {
    console.log(error);
  });
}

async function cwEmergency(status) {
  try {
    const response = await axios.post(
      'https://cw-staging-1.herokuapp.com/api/emergency_states',
      {
        emergency_state: {
          emergency_type: 2,
          description: status,
        },
      },
    );
    console.log('cwEmergency', response);
  } catch (error) {
    console.log(error);
  }
}
async function cwPosition(latitude, longitude) {
  try {
    const d = new Date();
    const response = await axios.post(
      'https://cw-staging-1.herokuapp.com/api/positions',
      {
        position:
      {
        latitude,
        longitude,
        accuracy: 30,
        recorded_at: d.toUTCString(),
      },
      },
    );

    console.log('cwPosition', response);
  } catch (error) {
    console.log('cwPosition', error);
  }
}
async function cwLoginPositionEmergency(username, password, status) {
  try {
    const response = await axios.post('https://cw-staging-1.herokuapp.com/api/tokens', {
      username,
      password,
      from_communicator: 'true',
      channel_id: 'dummy-value',
      device_type: 'alexa',
    });

    console.log('csLogin', response, response.data.token);
    axios.defaults.headers.common = { Authorization: `Token token=${response.data.token}` };

    cwPosition(49.278368, -123.106782);
    cwEmergency(status);
  } catch (error) {
    console.log('csLogin', error);
  }
}

module.exports = {

  cwLoginPositionEmergency,
  cwEmergency,
  cwPosition,
};
