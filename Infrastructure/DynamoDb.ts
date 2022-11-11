import {AttributeType, ProjectionType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Stack} from "aws-cdk-lib";


export class DynamoDb {

    private name: string;
    private primaryKey: string;
    private stack: Stack;
    private table: Table;
    public sortKey: string;

    public constructor(name: string, primaryKey: string, sortKey: string, stack: Stack) {
        this.name = name;
        this.primaryKey = primaryKey;
        this.stack = stack;
        this.sortKey = sortKey;
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

}
