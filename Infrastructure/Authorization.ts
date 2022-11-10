import { Construct } from "constructs";
import {CognitoUserPoolsAuthorizer, RestApi} from "aws-cdk-lib/aws-apigateway";
import {UserPool, UserPoolClient} from "aws-cdk-lib/aws-cognito";
import * as cognito from "aws-cdk-lib/aws-cognito";
import {CfnOutput} from "aws-cdk-lib";


export class Authorization {
    private scope: Construct;
    private api: RestApi;

    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    public authorizer: CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, api: RestApi) {
        this.api = api;
        this.scope = scope;
        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.createUserPoolClient();
        this.createAuthorizer();
    }

    private createUserPool(){
        this.userPool = new UserPool(this.scope, 'AWSBuilderTestUserPoolCDK', {
            userPoolName: 'AWSBuilderTestUserPoolCDK',
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true
                }
            },
            passwordPolicy: {
                minLength: 6,
                requireLowercase: true,
                requireDigits: true,
            },
            userVerification: {
                emailSubject: 'Verify your email for our awesome app!',
                emailBody: 'Thanks for signing up to our awesome app! Your verification code is {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE,
                smsMessage: 'Thanks for signing up to our awesome app! Your verification code is {####}',
            }
        });
        new CfnOutput(this.scope, 'UserPoolId', {
            value: this.userPool.userPoolId
        })
    }

    private createUserPoolClient(){
        this.userPoolClient = this.userPool.addClient('AWSBuilderTestUserPoolCDK-Client', {
            userPoolClientName: 'AWSBuilderTestUserPoolCDK-Client',
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            },
            generateSecret: false
        });
        new CfnOutput(this.scope, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        })
    }

    private createAuthorizer(){
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'AWSBuilderTestUserPoolCDK-Authorizer', {
            cognitoUserPools: [this.userPool],
            authorizerName: 'AWSBuilderTestUserPoolCDK-Authorizer',
            identitySource: 'method.request.header.Authorization'
        });
        this.authorizer._attachToApi(this.api);
    }
}
