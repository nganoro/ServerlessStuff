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
        PK: body.user_name,
        SK: 'profile',
        last_name: body.last_name,
        first_name: body.first_name,
        team: body.team,
        title: body.title,
        email: body.email,
        user_name: body.user_name,
        gsi1_sk: body.user_name,
        skills: body.skills,
        expert: body.expert
    }

    try {
        await dbClient.put({
            TableName: 'AB3-Table',
            Item: item
        }).promise()
    } catch (error) {
        result.body = error.message
    }

    return result;

}
