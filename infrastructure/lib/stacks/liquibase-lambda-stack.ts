import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cr from 'aws-cdk-lib/custom-resources';
import path from "path";


export interface LiquiBaseStackProps extends cdk.StackProps {
    ecsClusterName: string,
    ecsClusterVpcName: string,
    ecsClusterVpcId: string,
    dbSecretArn: string,
    dbWriterEndpointAddress: string,
    writerInstanceEndpoint: string,
    subnets: string[];
}

export class LiquibaseLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: LiquiBaseStackProps) {
        super(scope, id, props);

        const dbSecretObj = secretsmanager.Secret.fromSecretAttributes(this, 'DbSecret', {
            secretCompleteArn: props.dbSecretArn,
        });

        const ecsExecutionRole = new iam.Role(this, 'EcsExecutionRoleLiquibase', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        // This policy allows ECS agent to pull from ECR and write logs
        ecsExecutionRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
        );
        cdk.Tags.of(ecsExecutionRole).add("Estimo_2025", "");

        const ecsTaskRole = new iam.Role(this, 'EcsTaskRoleLiquibase', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });
        dbSecretObj.grantRead(ecsTaskRole);
        cdk.Tags.of(ecsTaskRole).add("Estimo_2025", "");

        const liquibaseTaskDef = new ecs.FargateTaskDefinition(this, 'LiquibaseTaskDefinition', {
            cpu: 256,
            memoryLimitMiB: 512,
            executionRole: ecsExecutionRole,
            taskRole: ecsTaskRole,
        });

        const liquibaseRepo = ecr.Repository.fromRepositoryName(this, 'liquibase-cloud-project-2025', "estimo/liquibase");
        liquibaseTaskDef.addContainer('Liquibase', {
            image: ecs.ContainerImage.fromEcrRepository(liquibaseRepo, 'latest'),
            logging: ecs.LogDriver.awsLogs({ streamPrefix: 'Liquibase' }),
            essential: true,
            command: [
                `--url=jdbc:postgresql://${props.writerInstanceEndpoint}/planitpoker`,
                "--username=springuser",
                "--password=${SPRING_DATASOURCE_PASSWORD}",
                "--changeLogFile=/liquibase/db/liquibase-changelog.xml",
                "update"
            ],
            secrets: {
                SPRING_DATASOURCE_PASSWORD: ecs.Secret.fromSecretsManager(dbSecretObj, 'password'),
            },
        });
        cdk.Tags.of(liquibaseTaskDef).add("Estimo_2025", "");

        const liquibaseRunner = new lambda.Function(this, 'LiquibaseRunner', {
            code: lambda.Code.fromAsset(path.join(__dirname, 'infrastructure/lib/lambda/liquibase-lambda')),
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'index.handler',
            environment: {
                CLUSTER_NAME: props.ecsClusterName,
                TASK_DEF: liquibaseTaskDef.taskDefinitionArn,
                SUBNETS: props.subnets.join(","),
            },
        });

        liquibaseRunner.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ecs:RunTask'],
            resources: [
                liquibaseTaskDef.taskDefinitionArn,
                `arn:aws:ecs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:cluster/${props.ecsClusterName}`],
        }));

    
        liquibaseRunner.addToRolePolicy(new iam.PolicyStatement({
            actions: ['iam:PassRole'],
            resources: [ecsTaskRole.roleArn, ecsExecutionRole.roleArn],//asta e un best practice am dat fix ce avea nevoie-arn
        }));
        cdk.Tags.of(liquibaseRunner).add("Estimo_2025", "");

        new cr.AwsCustomResource(this, 'LiquibaseRun', { // s a ales sa se faca asa, fara sa se mai puna intr o variabila separata si de fiecare data se va da invoke si la lambda implicit
            onCreate: {
                service: 'Lambda',
                action: 'invoke',
                parameters: {
                    FunctionName: liquibaseRunner.functionName,
                    InvocationType: 'RequestResponse'
                },
                physicalResourceId: cr.PhysicalResourceId.of('LiquibaseRunOnce'),

            },
            policy: cr.AwsCustomResourcePolicy.fromStatements([
                new iam.PolicyStatement({
                    actions: ['lambda:InvokeFunction'],
                    resources: [liquibaseRunner.functionArn],

                }),

            ]),

        });


    }
}
