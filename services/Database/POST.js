const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = (event, context, callback) => {

    const params = {
        Item: {
            "User_Id": {
                S: "" + Math.random()
            },
            "proficiency": {
                S: "expert"
            },
            "service": {
                S: "postlambda"
            },
            "first_name": {
                S: "test_firstName"
            },
            "last_name": {
                S: "test_lastName"
            },
            "title": {
                S: "SysDevEng"
            },
            "team": {
                S: "postLambda"
            }
        },
        TableName: "awb3Table"
    };

    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log(data);
            callback(null, data);
        }
    });

    return {
        statusCode: 200,
        body: 'Connected to table!'
    }
};
