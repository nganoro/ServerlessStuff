import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = 'AB3-Table';
const PRIMARY_KEY = 'team';
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
                    IndexName: 'SK-gsi1-sk-index',
                    ExpressionAttributeNames :{
                        '#team': 'team'
                    },
                    ExpressionAttributeValues: {
                        ':T': "profile",
                        ':team': keyValue
                    },
                    KeyConditionExpression: 'SK = :T',
                    ProjectionExpression: 'first_name, last_name',
                    FilterExpression: "#team = :team"
                }).promise();
                result.body = JSON.stringify(queryResponse);
            }
        } else {
            const queryResponse = await dbClient.scan({
                TableName: TABLE_NAME!,
            }).promise();
            result.body = JSON.stringify(queryResponse)
        }
    } catch (error) {
        result.body = error.message
    }

    return result;
}
