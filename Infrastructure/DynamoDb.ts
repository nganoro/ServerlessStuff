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

    public postLambdaIntegration: LambdaIntegration;
    public readLambdaIntegration: LambdaIntegration;
    public updateLambdaIntegration: LambdaIntegration;
    public deleteLambdaIntegration: LambdaIntegration;
    public teamReadLambdaIntegration: LambdaIntegration;

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

        this.table.addLocalSecondaryIndex({
            indexName: "service-index",
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'service',
                type: AttributeType.STRING,
            }

        })

        this.table.addGlobalSecondaryIndex({
            indexName: "proficiency-service-index",
            partitionKey: {
                name: 'proficiency',
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'service',
                type: AttributeType.STRING,
            }
        })

        this.table.addGlobalSecondaryIndex({
            indexName: "team-proficiency-index",
            partitionKey: {
                name: 'team',
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'proficiency',
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
