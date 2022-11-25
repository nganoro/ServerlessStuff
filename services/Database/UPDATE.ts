import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = 'awb3Table';
const PRIMARY_KEY = 'User_Id';
const SORT_KEY = 'proficiency';
const dbClient = new DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body:'',
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    }

    const requestBody = typeof event.body == 'object'? event.body: JSON.parse(event.body);
    const User_Id = event.queryStringParameters?.[PRIMARY_KEY];
    const proficiency = event.queryStringParameters?.[SORT_KEY];

        try {
            if (requestBody && User_Id) {
                const params = {
                    TableName: TABLE_NAME!,
                    Key: {
                        [PRIMARY_KEY]: User_Id,
                        [SORT_KEY]: proficiency
                    },
                    UpdateExpression: 'set #title = :v_userTitle, #team = :v_team',
                    ExpressionAttributeNames: {
                        '#title': 'title',
                        '#team': 'team'
                    },
                    ExpressionAttributeValues: {
                        ':v_userTitle': requestBody.title,
                        ':v_team': requestBody.team
                    },
                    ReturnValues: 'UPDATED_NEW'
                }

                const updatedResult = await dbClient.update(params).promise()
                result.body = JSON.stringify(updatedResult);
            }
        } catch (error) {
            result.body = error.message
        }

    return result;
}
