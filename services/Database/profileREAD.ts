import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = 'AB3-Table';
const PRIMARY_KEY = 'PK';
const SORT_KEY = 'SK';
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
                    ExpressionAttributeNames :{
                        '#SK': 'SK'
                    },
                    ExpressionAttributeValues: {
                        ':U': keyValue,
                        ':S': "profile"
                    },
                    KeyConditionExpression: 'PK = :U and begins_with(#SK, :S)',
                    ProjectionExpression: 'PK, SK, skills',
                }).promise();
                result.body = JSON.stringify(queryResponse);
            } else if (SORT_KEY! in event.queryStringParameters) {
                const keyValue = event.queryStringParameters[SORT_KEY!];
                const queryResponse = await dbClient.query({
                    TableName: TABLE_NAME!,
                    IndexName: 'SK-gsi1-sk-index',
                    ExpressionAttributeValues: {
                        ':U': keyValue,
                    },
                    KeyConditionExpression: 'SK = :U',
                    ProjectionExpression: 'PK, SK, gsi1_sk',
                }).promise();
                result.body = JSON.stringify(queryResponse);
            }
        }
    } catch (error) {
        result.body = error.message
    }

    return result;
}
