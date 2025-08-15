import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  Duration,
  RemovalPolicy,
  Tags,
} from "aws-cdk-lib";
import {
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import {
  CachePolicy,
  CfnDistribution,
  OriginBase,
  OriginRequestPolicy,
  PriceClass,
} from "aws-cdk-lib/aws-cloudfront";
import { S3OriginProps } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  Effect,
  PolicyStatement,
  ServicePrincipal,
  StarPrincipal,
} from "aws-cdk-lib/aws-iam";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Key } from "aws-cdk-lib/aws-kms";
import { S3Utils } from "../utils/s3-utils";
import { EncryptionKeyUtils } from "../utils/encryption-key-utils";

class MySimpleS3Origin extends OriginBase {
  constructor(fullyQualifiedBucketDomain: string, props?: S3OriginProps) {
    super(fullyQualifiedBucketDomain, props);
  }
  // note, intentionally violates the return type to render an object with no OAI properties
  protected renderS3OriginConfig() {
    return {};
  }
}

export interface FrontendStackProps extends cdk.StackProps {
  certificate: {
    arn: string;
    id: string;
    hostedZoneId: string;
    zoneName: string;
    hostedZoneDomain: string;
  };
  deploymentBucketName: string;
  distributionName: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);
    Tags.of(this).add("Estimo_2025", "frontend");

    const frontendCertificate = Certificate.fromCertificateArn(
      this,
      props.certificate.id,
      props.certificate.arn
    );
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      "hosted-zone",
      {
        hostedZoneId: props.certificate.hostedZoneId,
        zoneName: props.certificate.zoneName,
      }
    );

    const loggingBucketName = S3Utils.ConstructLoggingBucketName(
      props.deploymentBucketName
    );
    const loggingBucketKMSKeyName =
      EncryptionKeyUtils.ConstructKMSKeyName(loggingBucketName);
    const loggingBucketKMSKeyAlias =
      EncryptionKeyUtils.ConstructKMSKeyAlias(loggingBucketName);

    const loggingBucketEncryptionKey = new Key(this, loggingBucketKMSKeyName, {
      alias: loggingBucketKMSKeyAlias,
      description: `KMS key for the logging bucket of the Estimo frontend app`,
      removalPolicy: RemovalPolicy.DESTROY,
      enableKeyRotation: true,
    });

    // Grant CloudFront KMS permissions for the deployment bucket
    loggingBucketEncryptionKey.addToResourcePolicy(
      new PolicyStatement({
        actions: ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey*"],
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("s3.amazonaws.com")],
        resources: ["*"], // Needs to be *
      })
    );

    const loggingBucket = new s3.Bucket(this, loggingBucketName, {
      bucketName: `${loggingBucketName}-${this.account}-${this.region}`,
      enforceSSL: true,
      lifecycleRules: [
        {
          enabled: false,
          expiration: Duration.days(7),
          id: "DeleteAfter7Days",
        },
      ],
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: loggingBucketEncryptionKey,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const deyplomentBucketKMSKeyName = EncryptionKeyUtils.ConstructKMSKeyName(
      props.deploymentBucketName
    );
    const deploymentBucketKMSKeyAlias = EncryptionKeyUtils.ConstructKMSKeyAlias(
      props.deploymentBucketName
    );

    const bucketEncryptionKey = new Key(this, deyplomentBucketKMSKeyName, {
      alias: deploymentBucketKMSKeyAlias,
      description: `KMS key for the Estimo frontend app deployment bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      enableKeyRotation: true,
    });

    // Grant CloudFront KMS permissions for the deployment bucket
    bucketEncryptionKey.addToResourcePolicy(
      new PolicyStatement({
        actions: ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey*"],
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        resources: ["*"], // Needs to be *
      })
    );

    this.createDistribution(
      loggingBucket,
      bucketEncryptionKey,
      frontendCertificate,
      hostedZone,
      props.certificate.hostedZoneDomain,
      props.distributionName,
      props.deploymentBucketName
    );
  }

  createDistribution(
    loggingBucket: cdk.aws_s3.IBucket,
    bucketEncryptionKey: cdk.aws_kms.Key,
    certificate: cdk.aws_certificatemanager.ICertificate,
    hostedZone: cdk.aws_route53.IHostedZone,
    hostedZoneDomain: string,
    distributionName: string,
    deploymentBucketName: string
  ): void {
    const deploymentBucket = new Bucket(this, `${deploymentBucketName}`, {
      bucketName: deploymentBucketName,
      enforceSSL: true,
      lifecycleRules: [
        {
          enabled: false,
          expiration: Duration.days(7),
          id: "DeleteAfter7Days",
        },
      ],
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      encryption: BucketEncryption.KMS,
      encryptionKey: bucketEncryptionKey,
      removalPolicy: RemovalPolicy.DESTROY,
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: `/S3/${deploymentBucketName}`,
    });
    this.addPoliciesToBucket(deploymentBucket);

    const defaultDistributionPath = "/index.html";

    const distribution = new cloudfront.Distribution(this, distributionName, {
      comment: `Estimo Frontend App Distribution`,
      defaultBehavior: {
        origin: new MySimpleS3Origin(
          `${deploymentBucket.bucketName}.s3.${this.region}.amazonaws.com`,
          {
            originPath: `/`,
          }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: new OriginRequestPolicy(
          this,
          `estimo-frontend-origin-request`,
          {
            originRequestPolicyName: `estimo-frontend-origin-request`,
          }
        ),
      },
      defaultRootObject: defaultDistributionPath,
      certificate: certificate,
      domainNames: [`${hostedZoneDomain}`],
      enableLogging: true,
      logBucket: loggingBucket,
      logFilePrefix: `cloudfront/estimo-frontend-distribution`,
      logIncludesCookies: true,
      enableIpv6: true,
      priceClass: PriceClass.PRICE_CLASS_100,
      errorResponses: [
        {
          httpStatus: 400,
          responseHttpStatus: 200,
          responsePagePath: defaultDistributionPath,
          ttl: cdk.Duration.seconds(10),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: defaultDistributionPath,
          ttl: cdk.Duration.seconds(10),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: defaultDistributionPath,
          ttl: cdk.Duration.seconds(10),
        },
      ],
      geoRestriction: cloudfront.GeoRestriction.allowlist("RO"),
    });

    deploymentBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        resources: [deploymentBucket.bucketArn + "/*"],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": distribution.distributionArn, //`arn:aws:cloudfront::${Aws.ACCOUNT_ID}:distribution/${distribution.distributionId}`
          },
        },
      })
    );

    // Create Origin Access Control
    const oac = new cloudfront.CfnOriginAccessControl(
      this,
      `ubb-estimo-oac`,
      {
        originAccessControlConfig: {
          name: `ubb-estimo-oac`,
          originAccessControlOriginType: "s3",
          signingBehavior: "always",
          signingProtocol: "sigv4",
        },
      }
    );

    /**
     * Since CDK does not support creating of AOC for cloudfront distributions, we had to implement this workaround
     * https://github.com/aws/aws-cdk/issues/21771#issuecomment-1478470280
     * PR for this CDK feature is here => https://github.com/aws/aws-cdk-rfcs/issues/491
     */
    const cfnDistribution = distribution.node.defaultChild as CfnDistribution;
    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.OriginAccessControlId",
      oac.getAtt("Id")
    );

    // A record for the deployed app
    new ARecord(this, `a-record-estimo-frontend`, {
      zone: hostedZone,
      recordName: `frontend.${hostedZone.zoneName}`,
      ttl: Duration.seconds(3600),
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }

  private addPoliciesToBucket(userBucket: Bucket): void {
    userBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:*"],
        effect: Effect.DENY,
        principals: [new StarPrincipal()],
        resources: [userBucket.bucketArn, userBucket.bucketArn + "/*"],
        conditions: {
          Bool: {
            "aws:SecureTransport": "false",
          },
        },
      })
    );

    userBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:PutObject"],
        effect: Effect.DENY,
        principals: [new StarPrincipal()],
        resources: [userBucket.bucketArn + "/*"],
        conditions: {
          Null: {
            "s3:x-amz-server-side-encryption": "true",
          },
          StringNotEquals: {
            "s3:x-amz-server-side-encryption": "aws:kms",
          },
        },
      })
    );
  }
}
