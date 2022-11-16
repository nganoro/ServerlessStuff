import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const dbClient = new DynamoDB.DocumentClient();

export async function newItem(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDb',
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    }

    let body: any;

    if(event.body){
        body = JSON.parse(event.body);
    } else {
        result.body = 'body is invalid';
    }

    const item = {
        User_Id: 'User_id_CDK',
        proficiency: body.proficiency,
        first_name: body.firstName,
        last_name: body.lastName,
        service: body.service,
        team: body.team,
        title: body.title
    }

    try {
        await dbClient.put({
            TableName: 'awb3Table',
            Item: item
        }).promise()
    } catch (error) {
        result.body = error.message
    }

    return result;

}

// async function save(event : any) {
//     const name = event.queryStringParameters.name;
//
//     const item = {
//         name: name,
//         date: Date.now(),
//     };
//
//     console.log(item);
//     const savedItem = await saveItem(item);
//
//     return {
//         statusCode: 200,
//         body: JSON.stringify(savedItem),
//     };
// };
