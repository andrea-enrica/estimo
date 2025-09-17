export const CDK_DEFAULTS_EU_WEST_1 = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "eu-west-1",
}

export const DB_CLUSTER_STACK_PROPS = {
    dbClusterName: `aurora-pg-cluster`,
    defaultDbName: `planitpoker`,
    dbUser: `springuser`,
    dbClusterVpcId: `ApplicationVPC`,
    dbClusterVpcName: `application-vpc`,
    env: CDK_DEFAULTS_EU_WEST_1
};

export const NETWORK_STACK_PROPS = {
  privateMaskSize: 24, // 256 ips allowed
  publicMaskSize: 24, // 256 ips allowed
  env: CDK_DEFAULTS_EU_WEST_1
};

export const FRONTEND_STACK_PROPS = {
  certificate: {
    arn: "arn:aws:acm:us-east-1:372083569417:certificate/f2385fa3-d327-4937-b047-2442d151468c",
    id: "frontend-certificate",
    hostedZoneId: "Z09294753ST0DTHXUTAT2",
    zoneName: "ubb-sed-estimo.com",
    hostedZoneDomain: "frontend.ubb-sed-estimo.com",
  },
  deploymentBucketName: "estimo-deployment-bucket",
  distributionName: "frontend-distribution",
  env: CDK_DEFAULTS_EU_WEST_1
};

export const ECS_MONOLITH_STACK_PROPS = {
    ecsClusterName: `ecs-monolith-stack`,
    ecsClusterVpcId: `ApplicationVPC`,
    ecsClusterVpcName: `application-vpc`,
    auroraClusterId: `dbclusterstack-aurorapgcluster45510f9b-lormcwvblqkh`,
    dbSecretId: `DbClusterStackaurorapgclust-wsIpNVU9DUmy`,
    dbSecretArn: `arn:aws:secretsmanager:eu-west-1:372083569417:secret:DbClusterStackaurorapgclust-wsIpNVU9DUmy-55EmlC`,
    dbReaderEndpointAddress: `dbclusterstack-aurorapgcluster45510f9b-lormcwvblqkh.cluster-ro-clyo68mqwbtb.eu-west-1.rds.amazonaws.com`,
    dbWriterEndpointAddress: `dbclusterstack-aurorapgcluster45510f9b-lormcwvblqkh.cluster-clyo68mqwbtb.eu-west-1.rds.amazonaws.com`,
    readerInstanceEndpoint: `aurora-pg-cluster-instance2.clyo68mqwbtb.eu-west-1.rds.amazonaws.com`,
    writerInstanceEndpoint: `aurora-pg-cluster-instance1.clyo68mqwbtb.eu-west-1.rds.amazonaws.com`,
    appSecretId: `spring-aplication-secret`,
    appSecretArn: `arn:aws:secretsmanager:eu-west-1:372083569417:secret:spring-aplication-secret-xp1oxs`,
    certificateId: `b66d3866-1709-4c5e-a133-cc7a42da8359`,
    certificateArn: `arn:aws:acm:eu-west-1:372083569417:certificate/b66d3866-1709-4c5e-a133-cc7a42da8359`,
    frontendUrl: `https://frontend.ubb-sed-estimo.com`,
    env: CDK_DEFAULTS_EU_WEST_1
};

export const LIQUIBASE_LAMBDA_STACK_PROPS = {
  ecsClusterName: `EcsMonolithStack-ecsmonolithstack9D37130A-iJ3JYxC92Jdt`,
  ecsClusterVpcName: `application-vpc`,
  ecsClusterVpcId: `ApplicationVPC`,
  dbSecretArn: `arn:aws:secretsmanager:eu-west-1:372083569417:secret:DbClusterStackaurorapgclust-wsIpNVU9DUmy-55EmlC`,
  dbWriterEndpointAddress: `dbclusterstack-aurorapgcluster45510f9b-lormcwvblqkh.cluster-clyo68mqwbtb.eu-west-1.rds.amazonaws.com`,
  writerInstanceEndpoint: `aurora-pg-cluster-instance1.clyo68mqwbtb.eu-west-1.rds.amazonaws.com`,
  appSecretArn: `arn:aws:secretsmanager:eu-west-1:372083569417:secret:spring-aplication-secret-xp1oxs`,
  subnets: [`subnet-080507d1c6960f30b`, `subnet-0a5b61d4f80c235aa`],
  env: CDK_DEFAULTS_EU_WEST_1,
};

