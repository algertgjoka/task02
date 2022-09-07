import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class TodoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoDBTable = new Table(this, 'todo', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'todo',

      removalPolicy: RemovalPolicy.DESTROY,
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk'
        ],
      },
      depsLockFilePath: join(__dirname, 'lambdas', '../../package-lock.json'),
      environment: {
        PRIMARY_KEY: 'id',
        TABLE_NAME: dynamoDBTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
    };

    // Lambda functions for CRUD OP
    const createTodo = new NodejsFunction(this, 'createTodo', {
      entry: join(__dirname, 'lambdas', 'create.ts'),
      ...nodeJsFunctionProps,
    });
    const getTodo = new NodejsFunction(this, 'getTodo', {
      entry: join(__dirname, 'lambdas', 'get.ts'),
      ...nodeJsFunctionProps,
    });

    const getOneTodo = new NodejsFunction(this, 'getOneTodo', {
      entry: join(__dirname, 'lambdas', 'getOne.ts'),
      ...nodeJsFunctionProps,
    });
    const updateTodo = new NodejsFunction(this, 'updateTodo', {
      entry: join(__dirname, 'lambdas', 'update.ts'),
      ...nodeJsFunctionProps,
    });
    const deleteTodo = new NodejsFunction(this, 'deleteTodo', {
      entry: join(__dirname, 'lambdas', 'delete.ts'),
      ...nodeJsFunctionProps,
    });

    //Lambda access to dynamodb table
    dynamoDBTable.grantReadWriteData(createTodo);
    dynamoDBTable.grantReadData(getTodo);
    dynamoDBTable.grantReadData(getOneTodo);
    dynamoDBTable.grantReadWriteData(updateTodo);
    dynamoDBTable.grantReadWriteData(deleteTodo);

    // API GW
    const api = new RestApi(this, 'todoAPI', {
      restApiName: 'To-Do API',
      deployOptions: {
        stageName: 'v1'
      }
    });

    const todos = api.root.addResource('todo');
    todos.addMethod('PUT', new LambdaIntegration(createTodo));
    todos.addMethod('GET', new LambdaIntegration(getTodo));

    const singleTodo = todos.addResource('{id}')
    singleTodo.addMethod('GET', new LambdaIntegration(getOneTodo));
    singleTodo.addMethod('PUT', new LambdaIntegration(updateTodo));
    singleTodo.addMethod('DELETE', new LambdaIntegration(deleteTodo));

  }
}
