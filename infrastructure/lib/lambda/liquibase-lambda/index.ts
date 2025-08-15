import {
    ECSClient,
    LaunchType,
    RunTaskCommand,
    AssignPublicIp,
} from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({ region: "eu-west-1" });

export const handler = async (event: any): Promise<any> => {

    try {
        const runTaskParams = {
            cluster: process.env.CLUSTER_NAME!,
            taskDefinition: process.env.TASK_DEF!,
            launchType: LaunchType.FARGATE,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: process.env.SUBNETS!.split(','),
                    assignPublicIp: AssignPublicIp.DISABLED,
                },
            },
            count: 1,
        };
        const runTaskCommand = new RunTaskCommand(runTaskParams);
        console.log("Cluster name passed to ECS:", process.env.CLUSTER_NAME);

        const runTaskResponse = await ecsClient.send(runTaskCommand);
        if (!runTaskResponse.tasks || runTaskResponse.tasks.length === 0) {
            throw new Error("Nu s-a pornit niciun task ECS");
        }
        const taskArn = runTaskResponse.tasks[0].taskArn;
        console.log(`Task ECS pornit: ${taskArn}`);

        console.log("Task state:", runTaskResponse.tasks[0].lastStatus);

        return {
            statusCode: 200,
            body: `Task ECS pornit cu succes: ${taskArn}`,
        };
    } catch (error: any) {
        console.error("Eroare în Lambda ECS:", error);
        return {
            statusCode: 500,
            body: `Eroare: ${error.message || error}`,
        };
    }
};