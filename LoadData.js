var AWS = require("aws-sdk");
var fs = require('fs');


AWS.config.update({
    region: "us-east-1",
    //endpoint: "http://localhost:8000"
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

dbDocument = "MySlideShow.json";
var nDx = 1;


var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing Presentations into DynamoDB. Please wait.");

var allPresentations = JSON.parse(fs.readFileSync(dbDocument, 'utf8'));
allPresentations.forEach(function(presentation) {
    var params = {
        TableName: "SlideShow",
        Item: {
            "index": nDx++,
            "Slide": presentation.Slide,
            "PresentationName":  presentation.PresentationName,
            "userId": presentation.userId,
            "Content": presentation.Content,
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           return console.error("Unable to add presentation", presentation.Slide, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", presentation.Slide);
       }
    });
});