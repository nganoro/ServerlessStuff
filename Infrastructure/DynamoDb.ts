import {AttributeType, ProjectionType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Stack} from "aws-cdk-lib";
import { NodejsFunction }from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from "path";
import {Runtime} from "aws-cdk-lib/aws-lambda";

export interface TableProps {
    tableName: string,
    primaryKey: string,
    sortKey: string;
    postLambdaPath?: string,
    readLambdaPath?: string,
    updateLambdaPath?: string,
    deleteLambdaPath?: string,
    teamReadLambdaPath?: string,
    teamMemberReadLambdaPath?: string,
    profilePostLambdaPath?: string,
    profileReadLambdaPath?: string,
    profileUpdateLambdaPath?: string,
}

export class DynamoDb {

    private stack: Stack;
    private table: Table;
    private props: TableProps

    private postLambda: NodejsFunction | undefined;
    private readLambda: NodejsFunction | undefined;
    private updateLambda: NodejsFunction | undefined;
    private deleteLambda: NodejsFunction | undefined;
    private teamReadLambda: NodejsFunction | undefined;
    private teamMemberReadLambda: NodejsFunction | undefined;
    private profilePostLambda: NodejsFunction | undefined;
    private profileReadLambda: NodejsFunction | undefined;
    private profileUpdateLambda: NodejsFunction | undefined;

    public postLambdaIntegration: LambdaIntegration;
    public readLambdaIntegration: LambdaIntegration;
    public updateLambdaIntegration: LambdaIntegration;
    public deleteLambdaIntegration: LambdaIntegration;
    public teamReadLambdaIntegration: LambdaIntegration;
    public teamMemberReadLambdaIntegration: LambdaIntegration;
    public profilePostLambdaIntegeration: LambdaIntegration;
    public profileReadLambdaIntegeration: LambdaIntegration;
    public profileUpdateLambdaIntegeration: LambdaIntegration;

    public constructor(stack: Stack, props: TableProps) {
        this.stack = stack;
        this.props = props;
        this.initialize();
    }

    private initialize(){
        this.createTable();
        this.createLambdas();
        this.grantTableRights();
    }

    private createTable(){
        this.table = new Table(this.stack, this.props.tableName, {
            partitionKey: {
                name: this.props.primaryKey,
                type: AttributeType.STRING
            },
            sortKey: {
                name: this.props.sortKey,
                type: AttributeType.STRING
            },
            tableName: this.props.tableName
        })

        this.table.addGlobalSecondaryIndex({
            indexName: "service-SK-index",
            partitionKey: {
                name: 'service',
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING,
            }
        })

        this.table.addGlobalSecondaryIndex({
            indexName: "SK-gsi1-sk-index",
            partitionKey: {
                name: 'SK',
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'gsi1_sk',
                type: AttributeType.STRING,
            }
        })
    }

    private createLambdas(){
        if (this.props.postLambdaPath) {
            this.postLambda = this.createSingleLambda(this.props.postLambdaPath)
            this.postLambdaIntegration = new LambdaIntegration(this.postLambda);
        }
        if (this.props.readLambdaPath) {
            this.readLambda = this.createSingleLambda(this.props.readLambdaPath)
            this.readLambdaIntegration = new LambdaIntegration(this.readLambda);
        }
        if (this.props.updateLambdaPath) {
            this.updateLambda = this.createSingleLambda(this.props.updateLambdaPath)
            this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda);
        }
        // if (this.props.deleteLambdaPath) {
        //     this.deleteLambda = this.createSingleLambda(this.props.deleteLambdaPath);
        //     this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda);
        // }
        if (this.props.teamReadLambdaPath) {
            this.teamReadLambda = this.createSingleLambda(this.props.teamReadLambdaPath)
            this.teamReadLambdaIntegration = new LambdaIntegration(this.teamReadLambda);
        }
        if (this.props.teamMemberReadLambdaPath) {
            this.teamMemberReadLambda = this.createSingleLambda(this.props.teamMemberReadLambdaPath)
            this.teamMemberReadLambdaIntegration = new LambdaIntegration(this.teamMemberReadLambda);
        }
        if (this.props.profilePostLambdaPath){
            this.profilePostLambda = this.createSingleLambda(this.props.profilePostLambdaPath)
            this.profilePostLambdaIntegeration = new LambdaIntegration(this.profilePostLambda);
        }
        if (this.props.profileReadLambdaPath){
            this.profileReadLambda = this.createSingleLambda(this.props.profileReadLambdaPath)
            this.profileReadLambdaIntegeration = new LambdaIntegration(this.profileReadLambda);
        }
        if( this.props.profileUpdateLambdaPath){
            this.profileUpdateLambda = this.createSingleLambda(this.props.profileUpdateLambdaPath)
            this.profileUpdateLambdaIntegeration = new LambdaIntegration(this.profileUpdateLambda);
        }
    }

    private grantTableRights(){
        if(this.postLambda){
            this.table.grantWriteData(this.postLambda);
        }
        if(this.readLambda){
            this.table.grantReadData(this.readLambda)
        }
        if(this.updateLambda){
            this.table.grantWriteData(this.updateLambda)
        }
        // if(this.deleteLambda){
        //     this.table.grantWriteData(this.deleteLambda)
        // }
        if(this.teamReadLambda){
            this.table.grantReadData(this.teamReadLambda)
        }
        if(this.teamMemberReadLambda){
            this.table.grantReadData(this.teamMemberReadLambda)
        }
        if(this.profilePostLambda){
            this.table.grantWriteData(this.profilePostLambda)
        }
        if(this.profileReadLambda){
            this.table.grantReadData(this.profileReadLambda)
        }
        if(this.profileUpdateLambda){
            this.table.grantWriteData(this.profileUpdateLambda)
        }
    }

    private createSingleLambda(lambdaName: string): NodejsFunction{
        const lambdaId = `${this.props.tableName}-${lambdaName}`
        return new NodejsFunction(this.stack, lambdaId, {
            runtime: Runtime.NODEJS_14_X,
            memorySize: 512,
            entry: path.join(__dirname, '../services/Database/', `${lambdaName}.ts`),
            handler: 'handler'
        })
    }
}
