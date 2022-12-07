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
        PK: body.PK,
        SK: body.SK,
        gsi1_sk: body.PK
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
