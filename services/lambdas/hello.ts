import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';

export async function main(
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2>{
    console.log('Got an event:', event)

    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Successful lambda invocation'}),
        headers: {
        'Access-Control-Allow-Origin': '*'
        }
    };
}

