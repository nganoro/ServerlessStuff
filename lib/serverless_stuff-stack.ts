import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import {Authorization} from "../Infrastructure/Authorization";
import {AuthorizationType, Cors, LambdaIntegration, MethodOptions, RestApi} from "aws-cdk-lib/aws-apigateway";
import {DynamoDb} from "../Infrastructure/DynamoDb";
import * as iam from 'aws-cdk-lib/aws-iam';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class ServerlessStuffStack extends cdk.Stack {

  private api = new RestApi(this, 'ServerlessStuffStack', {
    defaultCorsPreflightOptions: {
      allowHeaders: Cors.DEFAULT_HEADERS,
      allowMethods: Cors.ALL_METHODS,
      allowCredentials: true,
      allowOrigins: Cors.ALL_ORIGINS
    },
  });

  private authorizer: Authorization;
  private suffix: string;
  private ab3AvatatBucket: Bucket;
  private awb3Table = new DynamoDb(this, {
        tableName: 'awb3Table',
        primaryKey: 'User_Id',
        sortKey: 'proficiency',
        postLambdaPath: 'POST',
        readLambdaPath: 'READ',
        updateLambdaPath: 'UPDATE'
      }
  )

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.authorizer = new Authorization(this, this.api);
    // this.initializeSuffix();
    // this.initializeAb3AvatarBucket();
    // this.policies = new Policies(this.ab3AvatatBucket);

    const images_bucket = new Bucket(
        this, 'ImagesBucket', {
            publicReadAccess: false,
            cors: [{
                allowedMethods: [
                    HttpMethods.HEAD,
                    HttpMethods.GET,
                    HttpMethods.PUT,
                    HttpMethods.DELETE
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*']
            }],
            transferAcceleration: true
        }
    )

    const s3UploadLambda = new NodejsFunction(this, 's3UploadLambda', {
        runtime: Runtime.NODEJS_14_X,
        memorySize: 512,
        handler: 'handler',
        entry: path.join(__dirname, '../services/lambdas/s3URLambda.ts'),
    });

    const s3UploadBucketsPolicy = new iam.PolicyStatement({
        actions: [
            's3:PutObject',
            's3:GetObject'
        ],
        resources: ['arn:aws:s3:::*'],
    });

    s3UploadLambda.role?.attachInlinePolicy(
        new iam.Policy(this, 'lambda-get-buckets-policy', {
            statements: [s3UploadBucketsPolicy],
        }),
    );

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId
      }
    }

    //helloLambda Integeration with API
    const postLambdaResource = this.api.root.addResource('hello');
    postLambdaResource.addMethod('POST', this.awb3Table.postLambdaIntegration, optionsWithAuthorizer);
    // const s3PresignedURlambdaIntegeration = new LambdaIntegration(s3UploadLambda);
    // const presignedUrlResource = postLambdaResource.addResource('{type}');
    // presignedUrlResource.addMethod('GET', s3PresignedURlambdaIntegeration, optionsWithAuthorizer);


        //read lambda resource & Integeration
    const readLamdbaResource = this.api.root.addResource('experts');
    readLamdbaResource.addMethod('GET', this.awb3Table.readLambdaIntegration, optionsWithAuthorizer);


    //update lambda resource & Integeration
    const updateLamdbaResource = this.api.root.addResource('update');
    updateLamdbaResource.addMethod('PUT', this.awb3Table.updateLambdaIntegration, optionsWithAuthorizer);

    // s3URLambda integration
    const s3PresignedURlambdaIntegeration = new LambdaIntegration(s3UploadLambda);
    const s3URLambdaResource = this.api.root.addResource('presignedURL');
    s3URLambdaResource.addMethod('GET', s3PresignedURlambdaIntegeration, optionsWithAuthorizer);
    s3URLambdaResource.addMethod('PUT', s3PresignedURlambdaIntegeration, optionsWithAuthorizer);

    }

    // private initializeSuffix() {
    //     const shortStackId = cdk.Fn.select(2, cdk.Fn.split('/', this.stackId));
    //     const Suffix = cdk.Fn.select(4, cdk.Fn.split('-', shortStackId));
    //     this.suffix = Suffix;
    // }

    // private initializeAb3AvatarBucket() {
    //     this.ab3AvatatBucket = new Bucket(this, 'awb3-avatar', {
    //         bucketName: 'awb3-avatar-' + this.suffix,
    //         publicReadAccess: false,
    //         cors: [{
    //             allowedMethods: [
    //                 HttpMethods.HEAD,
    //                 HttpMethods.GET,
    //                 HttpMethods.PUT,
    //                 HttpMethods.DELETE
    //             ],
    //             allowedOrigins: ['*'],
    //             allowedHeaders: ['*']
    //         }],
    //     });
    //
    //     this.ab3AvatatBucket.addToResourcePolicy(
    //         new iam.PolicyStatement({
    //             effect: iam.Effect.ALLOW,
    //             principals: [new iam.ServicePrincipal('lambda.amazonaws.com')],
    //             actions: [
    //                 's3:PutObject',
    //                 's3:PutObjectAcl'
    //             ],
    //             resources: [this.ab3AvatatBucket.bucketArn + '/*'],
    //         }),
    //     );
    //
    //     new cdk.CfnOutput(this, 'spaces-photos-bucket-name', {
    //         value: this.ab3AvatatBucket.bucketName
    //     })
    // }
}
