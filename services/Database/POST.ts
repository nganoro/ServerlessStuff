import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const dbClient = new DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDb',
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    }

    const body = typeof event.body == 'object'? event.body: JSON.parse(event.body);

    const item = {
        User_Id: body.user_name,
        proficiency: body.proficiency,
        first_name: body.first_name,
        last_name: body.last_name,
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