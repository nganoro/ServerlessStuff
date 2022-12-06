import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = 'AB3-Table';
const PRIMARY_KEY = 'PK';
const dbClient = new DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body:'',
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    }

    try {
        if (event.queryStringParameters) {
            if (PRIMARY_KEY! in event.queryStringParameters) {
                const keyValue = event.queryStringParameters[PRIMARY_KEY!];
                const queryResponse = await dbClient.query({
                    TableName: TABLE_NAME!,
                    ExpressionAttributeValues: {
                        ':P': keyValue,
                        ':S': 'profile'
                    },
                    KeyConditionExpression: 'PK = :P and SK = :S',
                    ProjectionExpression: 'first_name, last_name, team, title, user_name, email',
                }).promise();
                result.body = JSON.stringify(queryResponse);
            }
        } else {
                const profile = 'profile';
                const queryResponse = await dbClient.query({
                    TableName: TABLE_NAME!,
                    IndexName: 'SK-gsi1-sk-index',
                    ExpressionAttributeValues: {
                        ':S': profile
                    },
                    KeyConditionExpression: 'SK = :S',
                    ProjectionExpression: 'first_name, last_name, team, title, user_name, email',
                }).promise();
                result.body = JSON.stringify(queryResponse);
        }
    } catch (error) {
        result.body = error.message
    }
    return result;
}
