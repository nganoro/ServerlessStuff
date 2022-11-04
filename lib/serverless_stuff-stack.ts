import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { Bucket } from "aws-cdk-lib/aws-s3";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ServerlessStuffStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Bucket(this, 'AWSBuilderBucket4Nate', {})

    const handler = new Function(this, 'Hello-Lambda', {
      runtime: Runtime.NODEJS_14_X,
      memorySize: 512,
      handler: 'app.handler',
      code: Code.fromAsset(join(__dirname, '../lambdas'))
    })
  }
}
