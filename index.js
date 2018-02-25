'use strict';

const alexaSDK = require('alexa-sdk');
const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const db = require("dynamise");

AWS.config.update({
    region: "us-east-1",
});
const endpoint = "https://dynamodb.us-east-1.amazonaws.com";
const client = db(endpoint);

const Table = 'Presentations'; 
const APP_ID = 'INSERT YOUR SKILL ID HERE';  // TODO ! 

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build
// convert callback style functions to promises

const docClient = new AWS.DynamoDB.DocumentClient();
const dbScan   = promisify(docClient.scan, docClient);
const dbGet    = promisify(docClient.get, docClient);
const dbPut    = promisify(docClient.put, docClient);
const dbDelete = promisify(docClient.delete, docClient);

const presentationsTable = "SlideShow";  // Initial table name.  ask alexa to set presentation name and she will remember new name

var slideNum = 0;
var presentationName = "slideshow";

const languageStrings = {
    'en-US': {
        translation: {
            SKILL_NAME: 'Slide Handler',
            LAUNCH_MESSAGE: `What do you want to do?`,
            LAUNCH_REPROMPT: 'Say next slide or previous slide.',
            HELPME_REPROMPT: '',
        },
    },
};


exports.handler = function(event, context) {
    const alexa = alexaSDK.handler(event, context);
    alexa.appId = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest'() {
        this.response.speak(this.t('LAUNCH_MESSAGE'))
            .listen(this.t('LAUNCH_REPROMPT'));
        this.emit(':responseReady');    
    },
    'viewIntent': function() {
        this.emit(":tell", `The current presentation name is ${presentationName}`);
    },
    'presentationIntent': function(){
        const { slots } = this.event.request.intent;
        const { userId } = this.event.session.user;
        if (!slots.presentationNames.value) {
            return this.emit(':tell',`Presentation Name not found nor set.`);
        } else {
            console.log(`Invoking presentationIntent for ${slots.presentationNames.value} on userId: ${userId}` );
            presentationName = slots.presentationNames.value;
            return this.emit(':tell',`Presentation Name set to ${slots.presentationNames.value}`);
        }
    },
    'slideIntent': function() {
        const thisSlide = this.event.request.intent.slots.slideNum;
        if (thisSlide && thisSlide.value) {
            try {
                slideNum = parseInt(thisSlide.value);
            }
            catch (err) {
                slideNum = 1;
            }
        } else {
            slideNum = 0;
        }
        var dynamoParams = {
            TableName: presentationsTable,
            ProjectionExpression: "#slide, Content, userId",
            FilterExpression: "PresentationName = :p_name AND Slide = :slideNum",
            ExpressionAttributeNames: {
                "#slide": "Slide"
            },
            ExpressionAttributeValues: {
                ":p_name": presentationName,
                ":slideNum": slideNum,
            }
        };   

        dbScan(dynamoParams)
        .then(data => {
          console.log(`Read table ${presentationsTable} succeeded!`, data);
          var output = '';
          var reported = 0;
          if (data.Items && data.Count < 100 && data.Count > 0) {
            data.Items.forEach(item => { 
                reported += 1;
                output += ` ${item.Content} `; 
            });
          } else {
            output = `Sorry, but no slide ${slideNum} for ${presentationName} can be found!`;
          }
          console.log('slide: ', output);
          this.response.speak(output)
                       .listen(this.t('HELPME_REPROMPT'));
          this.emit(':responseReady');  
        })
        .catch(err => {
          console.error(err);
        });               
    },
    'nextIntent': function () {
        console.log(`nextIntent: ${slideNum}`);
        slideNum += 1;
        //saySlide(presentationsTable, 1);
        var dynamoParams = {
            TableName: presentationsTable,
            ProjectionExpression: "#slide, Content, userId",
            FilterExpression: "PresentationName = :p_name AND Slide = :slideNum",
            ExpressionAttributeNames: {
                "#slide": "Slide"
            },
            ExpressionAttributeValues: {
                ":p_name": presentationName,
                ":slideNum": slideNum,
            }
        };   

        dbScan(dynamoParams)
        .then(data => {
          console.log(`Read table ${presentationsTable} succeeded!`, data);
          var output = '';
          var reported = 0;
          if (data.Items && data.Count < 100 && data.Count > 0) {
            data.Items.forEach(item => { 
                reported += 1;
                output += ` ${item.Content} `; 
            });
          } else {
            output = `Sorry, but no slide ${slideNum} for ${presentationName} can be found!`;
          }
          console.log('slide: ', output);
          this.response.speak(output)
                       .listen(this.t('HELPME_REPROMPT'));
          this.emit(':responseReady');  
        })
        .catch(err => {
          console.error(err);
        });        
    },
    'prevIntent': function () {
        console.log("prevIntent:");
        slideNum -= 1;
        //saySlide(presentationsTable, 1);
        var dynamoParams = {
            TableName: presentationsTable,
            ProjectionExpression: "#slide, Content, userId",
            FilterExpression: "PresentationName = :p_name AND Slide = :slideNum",
            ExpressionAttributeNames: {
                "#slide": "Slide"
            },
            ExpressionAttributeValues: {
                ":p_name": presentationName,
                ":slideNum": slideNum,
            }
        };   

        dbScan(dynamoParams)
        .then(data => {
          console.log(`Read table ${presentationsTable} succeeded!`, data);
          var output = '';
          var reported = 0;
          if (data.Items && data.Count < 100 && data.Count > 0) {
            data.Items.forEach(item => { 
                reported += 1;
                output += ` ${item.Content} `; 
            });
          } else {
            output = `Sorry, but no slide ${slideNum} for ${presentationName} can be found!`;
          }
          console.log('slide: ', output);
          this.response.speak(output)
                    .listen(this.t('HELPME_REPROMPT'));
          this.emit(':responseReady');  
        })
        .catch(err => {
          console.error(err);
        });        
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('As you wish master!');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: alexa, open slide handler");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Okay');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, open slide handler'" +
            " or 'alexa, tell slide handler slide 1'");
    }
};
