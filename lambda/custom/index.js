// Lambda Function code for Alexa.
// Paste this into your index.js file.

const Alexa = require('ask-sdk');
const https = require('https');
const cw = require('./commandwear/commandwearAPI.js');

const invocationName = 'my school';

// Session Attributes
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {
  const memoryAttributes = {
    history: [],

    // The remaining attributes will be useful after DynamoDB persistence is configured
    launchCount: 0,
    lastUseTimestamp: 0,

    lastSpeechOutput: {},
    nextIntent: [],

    // "favoriteColor":"",
    // "name":"",
    // "namePronounce":"",
    // "email":"",
    // "mobileNumber":"",
    // "city":"",
    // "state":"",
    // "postcode":"",
    // "birthday":"",
    // "bookmark":0,
    // "wishlist":[],
  };
  return memoryAttributes;
}

const maxHistorySize = 20; // remember only latest 20 intents


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


    const say = 'Okay, talk to you later! ';

    return responseBuilder
      .speak(say)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const AMAZON_HelpIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const intents = getCustomIntents();
    const sampleIntent = randomElement(intents);

    let say = 'You asked for help. ';

    // let previousIntent = getPreviousIntent(sessionAttributes);
    // if (previousIntent && !handlerInput.requestEnvelope.session.new) {
    //     say += 'Your last intent was ' + previousIntent + '. ';
    // }
    // say +=  'I understand  ' + intents.length + ' intents, '

    say += ` Here something you can ask me, ${getSampleUtterance(sampleIntent)}`;

    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .getResponse();
  },
};

const AMAZON_PauseIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PauseIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const say = 'Hello from AMAZON.PauseIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .getResponse();
  },
};

const AMAZON_StartOverIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StartOverIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const say = 'Hello from AMAZON.StartOverIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .getResponse();
  },
};

const AMAZON_StopIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


    const say = 'Okay, talk to you later! ';

    return responseBuilder
      .speak(say)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const AMAZON_NavigateHomeIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const say = 'Hello from AMAZON.NavigateHomeIntent. ';


    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .getResponse();
  },
};

const StartLockdownIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'StartLockdownIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log(`cw.cwlogin(${process.env.USER_NAME}, ${process.env.PASSWORD}`);
    cw.cwLogin(process.env.USER_NAME, process.env.PASSWORD);

    const say = 'I\'ve started lock down. The office has been informed. Let me know when to lock the doors and once you have a student count.';

    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .getResponse();
  },
};

const StudentCountIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'StudentCountIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Hello from StudentCountIntent. ';

    let slotStatus = '';
    let resolvedSlot;

    const slotValues = getSlotValues(request.intent.slots);
    // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

    // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
    //   SLOT: number
    if (slotValues.number.heardAs) {
      slotStatus += ` slot number was heard as ${slotValues.number.heardAs}. `;
    } else {
      slotStatus += 'slot number is empty. ';
    }
    if (slotValues.number.ERstatus === 'ER_SUCCESS_MATCH') {
      slotStatus += 'a valid ';
      if (slotValues.number.resolved !== slotValues.number.heardAs) {
        slotStatus += `synonym for ${slotValues.number.resolved}. `;
      } else {
        slotStatus += 'match. ';
      } // else {
      //
    }
    if (slotValues.number.ERstatus === 'ER_SUCCESS_NO_MATCH') {
      slotStatus += 'which did not match any slot value. ';
      console.log(`***** consider adding "${slotValues.number.heardAs}" to the custom slot type used by slot number! `);
    }

    if ((slotValues.number.ERstatus === 'ER_SUCCESS_NO_MATCH') || (!slotValues.number.heardAs)) {
      slotStatus += `A few valid values are, ${sayArray(getExampleSlotValues('StudentCountIntent', 'number'), 'or')}`;
    }

    say += slotStatus;


    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .getResponse();
  },
};

const LaunchRequest_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;

    const say = `${randomElement(['hello', 'hi', 'greetings'])} and welcome to ${invocationName} ! Say help to hear some options.`;

    const skillTitle = capitalize(invocationName);

    if (supportsDisplay(handlerInput)) {
      const myImage1 = new Alexa.ImageHelper()
        .addImageInstance(DisplayImg1.url)
        .getImage();

      const myImage2 = new Alexa.ImageHelper()
        .addImageInstance(DisplayImg2.url)
        .getImage();

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText('Welcome to the skill!')
        .getTextContent();

      responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate2',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: myImage2,
        image: myImage1,
        title: skillTitle,
        textContent: primaryText,
      });
    }

    return responseBuilder
      .speak(say)
      .reprompt(`try again, ${say}`)
      .withStandardCard('Welcome!',
        `Hello!\nThis is a card for your skill, ${skillTitle}`,
        welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
      .getResponse();
  },
};

const SessionEndedHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const request = handlerInput.requestEnvelope.request;

    console.log(`Error handled: ${error.message}`);
    // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.  Please say again.')
      .reprompt('Sorry, an error occurred.  Please say again.')
      .getResponse();
  },
};


// 2. Constants ===========================================================================

// Here you can define static data, to be used elsewhere in your code.  For example:
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined; // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {
  return myString.replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}


function randomElement(myArray) {
  return (myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
  return (str.replace('<speak>', '').replace('</speak>', ''));
}


function getSlotValues(filledSlots) {
  const slotValues = {};

  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item]
      && filledSlots[item].resolutions
      && filledSlots[item].resolutions.resolutionsPerAuthority[0]
      && filledSlots[item].resolutions.resolutionsPerAuthority[0].status
      && filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            ERstatus: 'ER_SUCCESS_MATCH',
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved: '',
            ERstatus: 'ER_SUCCESS_NO_MATCH',
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        heardAs: filledSlots[item].value,
        resolved: '',
        ERstatus: '',
      };
    }
  }, this);

  return slotValues;
}

function getExampleSlotValues(intentName, slotName) {
  const examples = [];
  let slotType = '';
  let slotValuesFull = [];

  const intents = model.interactionModel.languageModel.intents;
  for (let i = 0; i < intents.length; i++) {
    if (intents[i].name == intentName) {
      const slots = intents[i].slots;
      for (let j = 0; j < slots.length; j++) {
        if (slots[j].name === slotName) {
          slotType = slots[j].type;
        }
      }
    }
  }
  const types = model.interactionModel.languageModel.types;
  for (let i = 0; i < types.length; i++) {
    if (types[i].name === slotType) {
      slotValuesFull = types[i].values;
    }
  }


  examples.push(slotValuesFull[0].name.value);
  examples.push(slotValuesFull[1].name.value);
  if (slotValuesFull.length > 2) {
    examples.push(slotValuesFull[2].name.value);
  }


  return examples;
}

function sayArray(myData, penultimateWord = 'and') {
  let result = '';

  myData.forEach((element, index, arr) => {
    if (index === 0) {
      result = element;
    } else if (index === myData.length - 1) {
      result += ` ${penultimateWord} ${element}`;
    } else {
      result += `, ${element}`;
    }
  });
  return result;
}

function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
{ //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
  const hasDisplay = handlerInput.requestEnvelope.context
    && handlerInput.requestEnvelope.context.System
    && handlerInput.requestEnvelope.context.System.device
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

  return hasDisplay;
}


const welcomeCardImg = {
  smallImageUrl: 'https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png',
  largeImageUrl: 'https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png',


};

const DisplayImg1 = {
  title: 'Jet Plane',
  url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png',
};
const DisplayImg2 = {
  title: 'Starry Sky',
  url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png',

};

function getCustomIntents() {
  const modelIntents = model.interactionModel.languageModel.intents;

  const customIntents = [];


  for (let i = 0; i < modelIntents.length; i++) {
    if (modelIntents[i].name.substring(0, 7) != 'AMAZON.' && modelIntents[i].name !== 'LaunchRequest') {
      customIntents.push(modelIntents[i]);
    }
  }
  return customIntents;
}

function getSampleUtterance(intent) {
  return randomElement(intent.samples);
}

function getPreviousIntent(attrs) {
  if (attrs.history && attrs.history.length > 1) {
    return attrs.history[attrs.history.length - 2].IntentRequest;
  }

  return false;
}

function getPreviousSpeechOutput(attrs) {
  if (attrs.lastSpeechOutput && attrs.history.length > 1) {
    return attrs.lastSpeechOutput;
  }

  return false;
}

function timeDelta(t1, t2) {
  const dt1 = new Date(t1);
  const dt2 = new Date(t2);
  const timeSpanMS = dt2.getTime() - dt1.getTime();
  const span = {
    timeSpanMIN: Math.floor(timeSpanMS / (1000 * 60)),
    timeSpanHR: Math.floor(timeSpanMS / (1000 * 60 * 60)),
    timeSpanDAY: Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
    timeSpanDesc: '',
  };


  if (span.timeSpanHR < 2) {
    span.timeSpanDesc = `${span.timeSpanMIN} minutes`;
  } else if (span.timeSpanDAY < 2) {
    span.timeSpanDesc = `${span.timeSpanHR} hours`;
  } else {
    span.timeSpanDesc = `${span.timeSpanDAY} days`;
  }


  return span;
}


const InitMemoryAttributesInterceptor = {
  process(handlerInput) {
    let sessionAttributes = {};
    if (handlerInput.requestEnvelope.session.new) {
      sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      const memoryAttributes = getMemoryAttributes();

      if (Object.keys(sessionAttributes).length === 0) {
        Object.keys(memoryAttributes).forEach((key) => { // initialize all attributes from global list
          sessionAttributes[key] = memoryAttributes[key];
        });
      }
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    }
  },
};

const RequestHistoryInterceptor = {
  process(handlerInput) {
    const thisRequest = handlerInput.requestEnvelope.request;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const history = sessionAttributes.history || [];

    let IntentRequest = {};
    if (thisRequest.type === 'IntentRequest') {
      const slots = [];

      IntentRequest = {
        IntentRequest: thisRequest.intent.name,
      };

      if (thisRequest.intent.slots) {
        for (const slot in thisRequest.intent.slots) {
          const slotObj = {};
          slotObj[slot] = thisRequest.intent.slots[slot].value;
          slots.push(slotObj);
        }

        IntentRequest = {
          IntentRequest: thisRequest.intent.name,
          slots,
        };
      }
    } else {
      IntentRequest = { IntentRequest: thisRequest.type };
    }
    if (history.length > maxHistorySize - 1) {
      history.shift();
    }
    history.push(IntentRequest);

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  },

};


const RequestPersistenceInterceptor = {
  process(handlerInput) {
    if (handlerInput.requestEnvelope.session.new) {
      return new Promise((resolve, reject) => {
        handlerInput.attributesManager.getPersistentAttributes()

          .then((sessionAttributes) => {
            sessionAttributes = sessionAttributes || {};


            sessionAttributes.launchCount += 1;

            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            handlerInput.attributesManager.savePersistentAttributes()
              .then(() => {
                resolve();
              })
              .catch((err) => {
                reject(err);
              });
          });
      });
    } // end session['new']
  },
};


const ResponseRecordSpeechOutputInterceptor = {
  process(handlerInput, responseOutput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const lastSpeechOutput = {
      outputSpeech: responseOutput.outputSpeech.ssml,
      reprompt: responseOutput.reprompt.outputSpeech.ssml,
    };

    sessionAttributes.lastSpeechOutput = lastSpeechOutput;

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  },
};

const ResponsePersistenceInterceptor = {
  process(handlerInput, responseOutput) {
    const ses = (typeof responseOutput.shouldEndSession === 'undefined' ? true : responseOutput.shouldEndSession);

    if (ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      sessionAttributes.lastUseTimestamp = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

      handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

      return new Promise((resolve, reject) => {
        handlerInput.attributesManager.savePersistentAttributes()
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    }
  },
};


// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    AMAZON_CancelIntent_Handler,
    AMAZON_HelpIntent_Handler,
    AMAZON_PauseIntent_Handler,
    AMAZON_StartOverIntent_Handler,
    AMAZON_StopIntent_Handler,
    AMAZON_NavigateHomeIntent_Handler,
    StartLockdownIntent_Handler,
    StudentCountIntent_Handler,
    LaunchRequest_Handler,
    SessionEndedHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(InitMemoryAttributesInterceptor)
  .addRequestInterceptors(RequestHistoryInterceptor)

// .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

// .addRequestInterceptors(RequestPersistenceInterceptor)
// .addResponseInterceptors(ResponsePersistenceInterceptor)

// .withTableName("askMemorySkillTable")
// .withAutoCreateTable(true)

  .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  interactionModel: {
    languageModel: {
      invocationName: 'my school',
      intents: [{
        name: 'AMAZON.CancelIntent',
        samples: [],
      },
      {
        name: 'AMAZON.HelpIntent',
        samples: [],
      },
      {
        name: 'AMAZON.PauseIntent',
        samples: [],
      },
      {
        name: 'AMAZON.StartOverIntent',
        samples: [],
      },
      {
        name: 'AMAZON.StopIntent',
        samples: [],
      },
      {
        name: 'AMAZON.NavigateHomeIntent',
        samples: [],
      },
      {
        name: 'StartLockdownIntent',
        slots: [],
        samples: [
          'please lockdown the class',
          'lockdown the class',
          'lockdown',
          'start lockdown',
        ],
      },
      {
        name: 'StudentCountIntent',
        slots: [{
          name: 'number',
          type: 'AMAZON.NUMBER',
        }],
        samples: [
          'there are {number} kids',
          'i have {number} students in my class',
          'there are {number} children',
        ],
      },
      {
        name: 'LaunchRequest',
      },
      ],
      types: [],
    },
  },
};
