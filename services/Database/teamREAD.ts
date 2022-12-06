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
                        ':U': keyValue
                    },
                    KeyConditionExpression: 'PK = :U',
                    ProjectionExpression: 'PK, Biography, Competencies, Market, Tenets',
                    // FilterExpression: 'contains (Subtitle, :topic)'
                }).promise();
                result.body = JSON.stringify(queryResponse);
            }
        } else {
            const team = 'team';
            const queryResponse = await dbClient.query({
                TableName: TABLE_NAME!,
                IndexName: 'SK-gsi1-sk-index',
                ExpressionAttributeValues: {
                    ':U': team
                },
                KeyConditionExpression: 'SK = :U',
                ProjectionExpression: 'PK, Biography, Competencies, Market, Tenets',
            }).promise();
            result.body = JSON.stringify(queryResponse)
        }
    } catch (error) {
        result.body = error.message
    }

    return result;
}
