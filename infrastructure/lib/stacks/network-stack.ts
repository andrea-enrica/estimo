import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface NetworkStackProps extends cdk.StackProps {
  privateMaskSize: number;
  publicMaskSize: number;
}

export class NetworkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    const publicSubnetConfig = {
      name: "PublicSubnet",
      subnetType: ec2.SubnetType.PUBLIC,
      cidrMask: props.publicMaskSize,
    };

    const privateSubnetConfig = {
      name: "PrivateSubnet",
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Uses NAT to go out
      cidrMask: props.privateMaskSize,
    };

    const vpc = new ec2.Vpc(this, "ApplicationVPC", {
      vpcName: "application-vpc",
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [privateSubnetConfig, publicSubnetConfig],
    });
    cdk.Tags.of(vpc).add("Estimo_2025", "");

    vpc.publicSubnets.forEach((subnet, index) => {
      cdk.Tags.of(subnet).add("Name", `PublicSubnet-Az${index + 1}`);
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      cdk.Tags.of(subnet).add("Name", `PrivateSubnet-Az${index + 1}`);
    });
  }
}
