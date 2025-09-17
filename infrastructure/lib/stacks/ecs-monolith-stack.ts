import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from "aws-cdk-lib/aws-rds";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {IpAddressType} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import {IPUtils} from "../utils/ip-utils";
import {aws_certificatemanager} from "aws-cdk-lib";

export interface EcsMonolithStackProps extends cdk.StackProps {
    ecsClusterName: string,
    ecsClusterVpcId: string,
    ecsClusterVpcName: string,
    auroraClusterId: string,
    dbSecretId: string,
    dbSecretArn: string,
    dbReaderEndpointAddress: string,
    dbWriterEndpointAddress: string,
    readerInstanceEndpoint: string,
    writerInstanceEndpoint: string,
    appSecretId: string,
    appSecretArn: string,
    certificateId: string,
    certificateArn: string,
    frontendUrl: string,
}

export class EcsMonolithStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EcsMonolithStackProps) {
        super(scope, id, props);

        // 1. ECS Service Setup
        const vpc = ec2.Vpc.fromLookup(this, props.ecsClusterVpcId, {
            vpcName: props.ecsClusterVpcName,
        });
        const cluster = new ecs.Cluster(this, props.ecsClusterName, {vpc});
        cdk.Tags.of(cluster).add("Estimo_2025", "");

        const ecsExecutionRole = new iam.Role(this, `${props.ecsClusterName}-execution-role`, {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });
        // This policy allows ECS agent to pull from ECR and write logs
        ecsExecutionRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
        );
        cdk.Tags.of(ecsExecutionRole).add("Estimo_2025", "");
        const ecsTaskRole = new iam.Role(this, `${props.ecsClusterName}-task-role`, {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });
        cdk.Tags.of(ecsTaskRole).add("Estimo_2025", "");

        const auroraCluster = rds.DatabaseCluster.fromDatabaseClusterAttributes(this, props.auroraClusterId, {
            clusterIdentifier: props.auroraClusterId,
            port: 5432,
            readerEndpointAddress: props.dbReaderEndpointAddress,
            clusterEndpointAddress: props.dbWriterEndpointAddress,
        });

        const dbSecret = secretsmanager.Secret.fromSecretCompleteArn(this, props.dbSecretId, props.dbSecretArn);
        dbSecret.grantRead(ecsExecutionRole);
        dbSecret.grantRead(ecsTaskRole);

        const appSecret = secretsmanager.Secret.fromSecretCompleteArn(this, props.appSecretId, props.appSecretArn);
        appSecret.grantRead(ecsExecutionRole);
        appSecret.grantRead(ecsTaskRole);


        const springTaskDef = new ecs.FargateTaskDefinition(this, 'SpringTaskDef', {
            cpu: 512,
            memoryLimitMiB: 1024,
            executionRole: ecsExecutionRole, // role for saving the container in ECS
            taskRole: ecsTaskRole, // role for the tasks executed by the container itself
        });
        cdk.Tags.of(springTaskDef).add("Estimo_2025", "");
        const springAppRepo = ecr.Repository.fromRepositoryName(this, 'backend-cloud-project-2025', "estimo/backend");
        const springContainer = springTaskDef.addContainer('SpringApp', {
            image: ecs.ContainerImage.fromEcrRepository(springAppRepo, "latest"),
            logging: ecs.LogDriver.awsLogs({streamPrefix: 'SpringApp'}),
            environment: {
                SPRING_DATASOURCE_USERNAME: 'springuser',
                SPRING_DATASOURCE_READ_ENDPOINT: `jdbc:postgresql://${props.dbReaderEndpointAddress}:5432/planitpoker?sslmode=require`,
                SPRING_DATASOURCE_WRITE_ENDPOINT: `jdbc:postgresql://${props.dbWriterEndpointAddress}:5432/planitpoker?sslmode=require`,
                SPRING_APPLICATION_ALLOWED_ORIGINS: `${props.frontendUrl}`
            },
            secrets: {
                SPRING_DATASOURCE_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
                SPRING_APPLICATION_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'app_secret'),
            },
            healthCheck: {
                command: ["CMD-SHELL", "curl -fsS http://localhost:8080/healthcheck || exit 1"],
                interval: cdk.Duration.seconds(30),
                timeout: cdk.Duration.seconds(5),
                startPeriod: cdk.Duration.seconds(20),
                retries: 3,
            },
        });

        springContainer.addContainerDependencies();
        springContainer.addPortMappings({containerPort: 8080});
        cdk.Tags.of(springContainer).add("Estimo_2025", "");

        const dbSg = ec2.SecurityGroup.fromSecurityGroupId(
            this, "DbSg", "sg-00888b08a0fffd30f"
        );

        const serviceSG = new ec2.SecurityGroup(this, "spring-service-sg", {
            vpc: vpc,
            allowAllOutbound: true,
        });

        dbSg.addIngressRule(serviceSG, ec2.Port.tcp(5432), "App to DB")
        cdk.Tags.of(serviceSG).add("Estimo_2025", "");

        const springService = new ecs.FargateService(this, 'SpringService', {
            cluster,
            taskDefinition: springTaskDef,
            desiredCount: 1,
            assignPublicIp: false,
            vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS},
            securityGroups: [serviceSG],
            enableExecuteCommand: true,
        });
        cdk.Tags.of(springService).add("Estimo_2025", "");

        // 2. Load Balancer Setup
        const albSG = new ec2.SecurityGroup(this, "alb-SG", {
            vpc: vpc,
            allowAllOutbound: true,
        });

        serviceSG.addIngressRule(albSG, ec2.Port.tcp(8080), "ALB to app");

        const enabledIpv4Prefixes = IPUtils.getEnabledIps();
        for (var ipv4 of enabledIpv4Prefixes) {
            albSG.addIngressRule(
                ec2.Peer.ipv4(ipv4),
                ec2.Port.tcp(443)
            );
            albSG.addIngressRule(
                ec2.Peer.ipv4(ipv4),
                ec2.Port.tcp(80)
            );
        }
        cdk.Tags.of(albSG).add("Estimo_2025", "");

        const alb = new elb.ApplicationLoadBalancer(this, "BackendALB", {
            vpc: vpc,
            internetFacing: true,
            ipAddressType: IpAddressType.IPV4,
            securityGroup: albSG,
            loadBalancerName: "EstimoALB",
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });
        cdk.Tags.of(alb).add("Estimo_2025", "");

        const certificate = aws_certificatemanager.Certificate.fromCertificateArn(this, props.certificateId, props.certificateArn);
        const httpsListener = alb.addListener('BackendALB-Https-Listener', {
            port: 443,
            open: true,
            certificates: [certificate],
        });

        alb.addListener('Http', {
            port: 80,
            open: true,
            defaultAction: elb.ListenerAction.redirect({
                protocol: 'HTTPS',
                port: '443',
            }),
        });

        httpsListener.addTargets("alb-target-group", {
            targetGroupName: "alb-target-group",
            healthCheck: {
                path: `/healthcheck`,
                healthyThresholdCount: 3,
                unhealthyThresholdCount: 3,
                healthyHttpCodes: "200",
                interval: cdk.Duration.seconds(30),
            },
            port: 8080,
            targets: [springService],
        });
        cdk.Tags.of(httpsListener).add("Estimo_2025", "");

    }
}