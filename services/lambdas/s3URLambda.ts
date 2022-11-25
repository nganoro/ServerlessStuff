// import * as AWS from 'aws-sdk';
import {APIGatewayProxyEventV2, APIGatewayProxyResult, Context} from 'aws-lambda';
const AWS = require("aws-sdk");

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> {
    const type = event.pathParameters!['type'];

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        }
    }

    const s3 = new AWS.S3({
        accessKeyId: '',
        secretAccessKey: '',
        useAccelerateEndpoint: true
    });

    if (type == 'post') {

        const bucketName = 'serverlessstuffstack-imagesbucket1e86afb2-acjky0zhzn6z';
        // const keyValue = event.queryStringParameters![PRIMARY_KEY] + '.jpeg';
        var key = 'videos' + '/' + 'SampleVideo_1280x720_1mb.jpeg'; //im using a hardcoded filename, but get the file name dynamically that you'll upload to the s3 bucket
        const signedUrlExpireSeconds = 60 * 5;

        const url = s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: key,
            Expires: signedUrlExpireSeconds,
            ContentType: 'image/jpeg'
        });

        result.body =  JSON.stringify({filename: key, presigned_url: url});

    } else if(type == 'get'){

        const bucketName = 'serverlessstuffstack-imagesbucket1e86afb2-acjky0zhzn6z';
        // const keyValue = event.queryStringParameters![PRIMARY_KEY] + '.jpeg';
        var key = 'videos' + '/' + 'SampleVideo_1280x720_1mb.jpeg'; //im using a hardcoded filename, but get the file name dynamically that you'll upload to the s3 bucket
        const signedUrlExpireSeconds = 60 * 5;

        const url = s3.getSignedUrl('getObject', {
            Bucket: bucketName,
            Key: key,
            Expires: signedUrlExpireSeconds,
        });

        result.body =  JSON.stringify({filename: key, presigned_url: url});

    }

    return result;
}
