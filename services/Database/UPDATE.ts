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

    const requestBody = typeof event.body == 'object'? event.body: JSON.parse(event.body);
    const PK = event.queryStringParameters?.[PRIMARY_KEY];
    const SK = event.queryStringParameters?.[SORT_KEY];

        try {
            if (requestBody && PK) {
                const params = {
                    TableName: TABLE_NAME!,
                    Key: {
                        [PRIMARY_KEY]: PK,
                        [SORT_KEY]: SK
                    },
                    UpdateExpression: 'set #title = :v_userTitle, #team = :v_team, #fName = :v_fName, #lName = :v_lName, #skills = :v_skills, #expert = :v_expert',
                    ExpressionAttributeNames: {
                        '#title': 'title',
                        '#team': 'team',
                        '#fName': 'first_name',
                        '#lName': 'last_name',
                        '#skills': 'skills',
                        '#expert': 'expert'
                    },
                    ExpressionAttributeValues: {
                        ':v_userTitle': requestBody.title,
                        ':v_team': requestBody.team,
                        ':v_fName': requestBody.first_name,
                        ':v_lName': requestBody.last_name,
                        ':v_skills': requestBody.skills,
                        ':v_expert': requestBody.expert

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
