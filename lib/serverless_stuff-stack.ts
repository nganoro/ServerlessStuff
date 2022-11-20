import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {join} from 'path';
import {Bucket} from "aws-cdk-lib/aws-s3";
import {Authorization} from "../Infrastructure/Authorization";
import {Cors, AuthorizationType, LambdaIntegration, MethodOptions, RestApi} from "aws-cdk-lib/aws-apigateway";
import {DynamoDb} from "../Infrastructure/DynamoDb";
import { NodejsFunction }from 'aws-cdk-lib/aws-lambda-nodejs';
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
  private awb3Table = new DynamoDb(this, {
        tableName: 'awb3Table',
        primaryKey: 'User_Id',
        sortKey: 'proficiency',
        postLambdaPath: 'POST',
        readLambdaPath: 'READ'
      }
  )

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.authorizer = new Authorization(this, this.api);
    new Bucket(this, 'AWSBuilderBucket4Nate', {})

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId
      }
    }

    //helloLambda Integeration with API
    const postLambdaResource = this.api.root.addResource('hello');
    postLambdaResource.addMethod('POST', this.awb3Table.postLambdaIntegration, optionsWithAuthorizer);

    //read lambda resource & Integeration
    const readLamdbaResource = this.api.root.addResource('experts');
    readLamdbaResource.addMethod('GET', this.awb3Table.readLambdaIntegration, optionsWithAuthorizer);

  }
}
