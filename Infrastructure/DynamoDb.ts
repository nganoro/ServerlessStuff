import {AttributeType, GlobalSecondaryIndexProps, LocalSecondaryIndexProps, ProjectionType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Stack} from "aws-cdk-lib";


export class DynamoDb {

    private name: string;
    private primaryKey: string;
    private stack: Stack;
    private table: Table;
    public sortKey = 'proficiency';

    public constructor(name: string, primaryKey: string, stack: Stack) {
        this.name = name;
        this.primaryKey = primaryKey;
        this.stack = stack;
        this.initialize();
    }

    private initialize(){
        this.createTable();
    }

    private createTable(){
        this.table = new Table(this.stack, this.name, {
            partitionKey: {
                name: this.primaryKey,
                type: AttributeType.STRING
            },
            sortKey: {
                name: this.sortKey,
                type: AttributeType.STRING
            }
        })

        const localSecondaryIndexProps: LocalSecondaryIndexProps = {
            indexName: 'proficiency-index',
            sortKey: {
                name: 'proficiency',
                type: AttributeType.STRING,
            },

            // the properties below are optional
            projectionType: ProjectionType.ALL
        };

        const globalSecondaryIndexProps: GlobalSecondaryIndexProps = {
            indexName: 'proficiency-service-index',
            partitionKey: {
                name: 'proficiency',
                type: AttributeType.STRING,
            },

            // the properties below are optional
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'service',
                type: AttributeType.STRING,
            },
        };

        const globalSecondaryIndexProps2: GlobalSecondaryIndexProps = {
            indexName: 'team-proficiency-index',
            partitionKey: {
                name: 'team',
                type: AttributeType.STRING,
            },

            // the properties below are optional
            projectionType: ProjectionType.ALL,
            sortKey: {
                name: 'proficiency',
                type: AttributeType.STRING,
            },
        };

    }

}
