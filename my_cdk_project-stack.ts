import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for storing files
    new s3.Bucket(this, 'woocommerce-s3', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true // Useful for development environments
    });

    // DynamoDB table for storing data
    const table = new dynamodb.Table(this, 'woocommerce-dynamodb', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    // Lambda function for business logic
    const lambdaFunction = new lambda.Function(this, 'woocommerce-lamba', {
      runtime: lambda.Runtime.NODEJS_20_X, // Updated runtime to Node.js 20.x
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
      

    // API Gateway to expose the Lambda function
    new apigateway.LambdaRestApi(this, 'woocommerce-apigateway', {
      handler: lambdaFunction,
    });

    // Grant the Lambda function permissions to access the DynamoDB table
    table.grantReadWriteData(lambdaFunction);
  }
}
