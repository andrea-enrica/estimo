import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from "aws-cdk-lib/aws-rds";
import {CaCertificate} from "aws-cdk-lib/aws-rds";

export interface DbClusterStackProps extends cdk.StackProps {
    dbClusterName: string,
    defaultDbName: string,
    dbUser: string,
    dbClusterVpcId: string,
    dbClusterVpcName: string,
}

export class DbClusterStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DbClusterStackProps) {
        super(scope, id, props);

        const vpc = ec2.Vpc.fromLookup(this, props.dbClusterVpcId, {
            vpcName: props.dbClusterVpcName,
        });

        const dbSecurityGroup = new ec2.SecurityGroup(this, `${props.dbClusterName}-security-group`, {
            vpc,
            allowAllOutbound: true,
        });

        const dbEngine = rds.DatabaseClusterEngine.auroraPostgres({
            version: rds.AuroraPostgresEngineVersion.VER_15_10,
        });
        const clusterParameters: { [key: string]: string } = {
            lc_monetary: "en_US.UTF-8",
            lc_numeric: "en_US.UTF-8",
            lc_time: "en_US.UTF-8",
            log_min_messages: "log",
            log_min_error_statement: "log",
            log_connections: "1",
            log_disconnections: "1",
            "rds.log_retention_period": "10080",
        };
        clusterParameters["rds.force_ssl"] = "1";
        const instanceParameters: { [key: string]: string } = {
            log_rotation_age: "1440",
            client_min_messages: "warning",
            log_filename: "postgresql.log.%Y-%m-%d",
            lc_messages: "en_US.UTF-8",
        };

        const customInstanceParameterGroup = new rds.ParameterGroup(
            this,
            `${props.dbClusterName}-instance-parameter-group`,
            {
                engine: dbEngine,
                parameters: instanceParameters,
                description: "Custom parameter group based on Cloud City Building Blocks requirements",
            },
        );
        const auroraCluster = new rds.DatabaseCluster(this, `${props.dbClusterName}`, {
            engine: dbEngine,
            vpc: vpc,
            vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS},
            defaultDatabaseName: `${props.defaultDbName}`,
            credentials: rds.Credentials.fromGeneratedSecret(`${props.dbUser}`),
            serverlessV2MinCapacity: 0,
            serverlessV2MaxCapacity: 1,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            parameters: clusterParameters,
            port: 5432,
            copyTagsToSnapshot: true,
            writer: rds.ClusterInstance.serverlessV2("ClusterWriterInstance", {
                enablePerformanceInsights: false,
                autoMinorVersionUpgrade: true,
                parameterGroup: customInstanceParameterGroup,
                caCertificate: CaCertificate.RDS_CA_RSA2048_G1,
                instanceIdentifier: `${props.dbClusterName}-instance1`,
            }),
            readers: [
                rds.ClusterInstance.serverlessV2("ClusterReaderInstance1", {
                    enablePerformanceInsights: false,
                    autoMinorVersionUpgrade: true,
                    parameterGroup: customInstanceParameterGroup,
                    caCertificate: CaCertificate.RDS_CA_RSA2048_G1,
                    instanceIdentifier: `${props.dbClusterName}-instance2`,
                })
            ]
        });
        cdk.Tags.of(auroraCluster).add("Estimo_2025", "");

        dbSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(5432));
        auroraCluster.connections.addSecurityGroup(dbSecurityGroup);

    }
}