import {
    ECSClient,
    LaunchType,
    RunTaskCommand,
    AssignPublicIp,
} from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({ region: "eu-west-1" });

export const handler = async () => {
    try {
        const cluster = process.env.CLUSTER_NAME!;
        const taskDefinition = process.env.TASK_DEF!;
        const subnets = process.env.SUBNETS!.split(",");

        // Optional env: SECURITY_GROUPS="sg-abc,sg-def"
        const sgEnv = process.env.SECURITY_GROUPS;
        const securityGroups = sgEnv && sgEnv.trim().length > 0
            ? sgEnv.split(",").map(s => s.trim())
            : undefined; // let ECS attach the VPC default SG

        const runTaskParams = {
            cluster,
            taskDefinition,
            launchType: LaunchType.FARGATE,
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets,
                    ...(securityGroups ? { securityGroups } : {}), // only include if provided
                    assignPublicIp: AssignPublicIp.DISABLED,
                },
            },
        };

        console.log("RunTask params (sanitized):", {
            cluster,
            taskDefinition,
            subnets,
            securityGroups: securityGroups ?? "(default VPC SG)",
            assignPublicIp: "DISABLED",
        });

        const resp = await ecsClient.send(new RunTaskCommand(runTaskParams));
        if (resp.failures?.length) {
            console.error("RunTask failures:", JSON.stringify(resp.failures, null, 2));
            throw new Error(
                `RunTask failed: ${resp.failures.map(f => `${f.arn ?? ""} ${f.reason}`).join("; ")}`
            );
        }

        const taskArn = resp.tasks?.[0]?.taskArn;
        if (!taskArn) throw new Error("No task ARN returned from RunTask");

        console.log("Started task:", taskArn, "status:", resp.tasks?.[0]?.lastStatus);
        return { statusCode: 200, body: `Task started: ${taskArn}` };
    } catch (error: any) {
        console.error("Lambda error:", error);
        return { statusCode: 500, body: `Error: ${error.message || error}` };
    }
};