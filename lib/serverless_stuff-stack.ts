import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {join} from 'path';
import {Bucket} from "aws-cdk-lib/aws-s3";
import {Authorization} from "../Infrastructure/Authorization";
import {AuthorizationType, LambdaIntegration, MethodOptions, RestApi} from "aws-cdk-lib/aws-apigateway";
import {DynamoDb} from "../Infrastructure/DynamoDb";


export class ServerlessStuffStack extends cdk.Stack {

  private api = new RestApi(this, 'ServerlessStuffStack');
  private authorizer: Authorization;
  private awb3Table = new DynamoDb(
      'awb3Table',
      'User_Id',
      this
  )

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.authorizer = new Authorization(this, this.api);

    new Bucket(this, 'AWSBuilderBucket4Nate', {})

    const firstLambda = new Function(this, 'helloLambda', {
      runtime: Runtime.NODEJS_14_X,
      memorySize: 512,
      handler: 'app.handler',
      code: Code.fromAsset(join(__dirname, '../services/lambdas'))
    })

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId
      }
    }

    //helloLambda Integeration with API
    const helloLambdaIntegeration = new LambdaIntegration(firstLambda);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegeration, optionsWithAuthorizer);

  }
}
