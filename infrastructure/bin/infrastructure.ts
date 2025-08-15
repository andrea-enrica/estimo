#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/stacks/frontend-monolith-stack";
import { NetworkStack } from "../lib/stacks/network-stack";
import {
  DB_CLUSTER_STACK_PROPS,
  NETWORK_STACK_PROPS,
  FRONTEND_STACK_PROPS,
  ECS_MONOLITH_STACK_PROPS,
  // LIQUIBASE_LAMBDA_STACK_PROPS
} from "../lib/constants/props-constants";
import { DbClusterStack, DbClusterStackProps } from "../lib/stacks/db-cluster-stack";
import {EcsMonolithStack} from "../lib/stacks/ecs-monolith-stack";
import { LiquibaseLambdaStack} from '../lib/stacks/liquibase-lambda-stack';


const app = new cdk.App();

new NetworkStack(app, "NetworkStack", NETWORK_STACK_PROPS);
new FrontendStack(
    app,
    "FrontendStack",
    FRONTEND_STACK_PROPS
);
new DbClusterStack(app, "DbClusterStack", DB_CLUSTER_STACK_PROPS);
new EcsMonolithStack(app, 'EcsMonolithStack', ECS_MONOLITH_STACK_PROPS);
// new LiquibaseLambdaStack(app, "LiquibaseLambdaStack", LIQUIBASE_LAMBDA_STACK_PROPS);


