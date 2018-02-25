var awsSDK = require("aws-sdk");
const db = require("dynamise");
awsSDK.config.update({
    region: "us-east-1",
  });

const endpoint = "https://dynamodb.us-east-1.amazonaws.com";
const client = db(endpoint);
const tableName = 'SlideShow';

client.remove(tableName)
.then(function (data) {
    client.active(tableName)
    .then(function (res) {
        if (res.TableName === tableName) {
            console.log("Table Deletion is complete!");
        }
    })
    .catch(err => {
        created = 'Error';
        console.error(`DELETION Complete`);
    });      
    console.log(`DELETE in progress: ${data.TableDescription.TableName}`);
})
.catch(err => {
    created = 'Error';
    errmsg = JSON.stringify(err, null, 2);
    console.error(`ERROR during read request: ${errmsg}`);
});   
