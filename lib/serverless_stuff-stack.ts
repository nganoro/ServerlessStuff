import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket, HttpMethods} from "aws-cdk-lib/aws-s3";
import {Authorization} from "../Infrastructure/Authorization";
import {AuthorizationType, Cors, LambdaIntegration, MethodOptions, RestApi} from "aws-cdk-lib/aws-apigateway";
import {DynamoDb} from "../Infrastructure/DynamoDb";
import * as iam from 'aws-cdk-lib/aws-iam';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as CloudFront from 'aws-cdk-lib/aws-cloudfront';
import {CloudFrontAllowedMethods} from 'aws-cdk-lib/aws-cloudfront';
import {Duration} from "aws-cdk-lib";

const site_url = 'ab3sitebucket-nganoro'

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

  private ab3FinalTable = new DynamoDb(this, {
    tableName: 'AB3-Table',
    primaryKey: 'PK',
    sortKey: 'SK',
    postLambdaPath: 'POST',
    readLambdaPath: 'READ',
    updateLambdaPath: 'UPDATE',
    teamReadLambdaPath: 'teamREAD',
    teamMemberReadLambdaPath: 'teamMemberReadLambda',
    profilePostLambdaPath: 'profilePOST',
    profileReadLambdaPath: 'profileREAD',
    profileUpdateLambdaPath: 'profileUPDATE'
  });

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
    postLambdaResource.addMethod('POST', this.ab3FinalTable.postLambdaIntegration, optionsWithAuthorizer);
    const s3PresignedURlambdaIntegeration = new LambdaIntegration(s3UploadLambda);
    const presignedUrlResource = postLambdaResource.addResource('{type}');
    presignedUrlResource.addMethod('GET', s3PresignedURlambdaIntegeration, optionsWithAuthorizer);


    //read lambda resource & Integeration
    const readLamdbaResource = this.api.root.addResource('experts');
    readLamdbaResource.addMethod('GET', this.ab3FinalTable.readLambdaIntegration, optionsWithAuthorizer);


    //update lambda resource & Integeration
    const updateLamdbaResource = this.api.root.addResource('update');
    updateLamdbaResource.addMethod('PUT', this.ab3FinalTable.updateLambdaIntegration, optionsWithAuthorizer);

    //update lambda resource & Integeration
    const teamReadLambdaResource = this.api.root.addResource('teams');
    teamReadLambdaResource.addMethod('GET', this.ab3FinalTable.teamReadLambdaIntegration, optionsWithAuthorizer);

    const teamMemberReadLambdaResource = this.api.root.addResource('TeamMember');
    teamMemberReadLambdaResource.addMethod('GET', this.ab3FinalTable.teamMemberReadLambdaIntegration, optionsWithAuthorizer);

    const postProfileLambdaResource = this.api.root.addResource('Profile');
    postProfileLambdaResource.addMethod('POST', this.ab3FinalTable.profilePostLambdaIntegeration, optionsWithAuthorizer);
    postProfileLambdaResource.addMethod('GET', this.ab3FinalTable.profileReadLambdaIntegeration, optionsWithAuthorizer);
    postProfileLambdaResource.addMethod('PUT', this.ab3FinalTable.profileUpdateLambdaIntegeration, optionsWithAuthorizer);

    //website hosting bucket
    const ab3SiteBucket_Natnael = new Bucket(
        this, 'ab3SiteBucket_Natnael', {
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
            bucketName: site_url,
            websiteIndexDocument: 'index.html'
        }
    )


    //Cloudfront certificates
    // const certificationArn = new acm.Dns

    // CloudFront distributions
    const cfIndentity = new CloudFront.OriginAccessIdentity(this, 'cfId');
    ab3SiteBucket_Natnael.addToResourcePolicy(new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [ab3SiteBucket_Natnael.arnForObjects("*")],
        principals: [new iam.CanonicalUserPrincipal(cfIndentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));
    const distribution = new CloudFront.CloudFrontWebDistribution(this, 'ab3sitedistributions', {
        originConfigs: [
            {
                s3OriginSource: {
                    s3BucketSource: ab3SiteBucket_Natnael,
                    originAccessIdentity: cfIndentity
                },
                behaviors: [{
                    isDefaultBehavior: true,
                    allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
                    defaultTtl: Duration.days(0),
                    compress: true,
                }],
            }
        ],
        // viewerCertificate: CloudFront.ViewerCertificate.fromCloudFrontDefaultCertificate(
        //     'd111111abcdef8.cloudfront.net'
        // ),
    })
    }
}
