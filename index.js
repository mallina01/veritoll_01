console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();
var querystring = require("querystring");
const https = require('https');


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    var city = event.queryStringParameters.city;
    if(!city){
        done({message: "Please provide city name"});
        return;
    }
    var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + querystring.escape(city) + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
    console.log(url);

    https.get(url,
    (resp) => {
        let data = '';

      // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

      // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data).explanation);
            done(null, JSON.parse(data));
        });
    
    }).on("error", (err) => {
      console.log("Error: " + err.message);
      done(err)
    });
};
