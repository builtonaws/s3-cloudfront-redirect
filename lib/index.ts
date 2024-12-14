import { RemovalPolicy } from "aws-cdk-lib";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Distribution, HttpVersion } from "aws-cdk-lib/aws-cloudfront";
import { S3StaticWebsiteOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  ARecord,
  AaaaRecord,
  type IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket, RedirectProtocol } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

/**
 * Properties to create a S3 CloudFront redirect.
 */
export interface S3CloudFrontRedirectProps {
  /**
   * Hosted zone for origin domain.
   */
  readonly hostedZone: IHostedZone;
  /**
   * Certificate to secure distribution. Must be in partition leader region, e.g. us-east-1.
   */
  readonly certificate: ICertificate;
  /**
   * Origin domain name.
   */
  readonly originDomain: string;
  /**
   * Target domain name.
   */
  readonly targetDomain: string;
}

export class S3CloudFrontRedirect extends Construct {
  /**
   * Hosted zone for origin domain.
   */
  readonly hostedZone: IHostedZone;
  /**
   * Certificate to secure distribution. Must be in partition leader region, e.g. us-east-1.
   */
  readonly certificate: ICertificate;
  /**
   * Origin domain name.
   */
  readonly originDomain: string;
  /**
   * Target domain name.
   */
  readonly targetDomain: string;

  constructor(scope: Construct, id: string, props: S3CloudFrontRedirectProps) {
    super(scope, id);

    this.hostedZone = props.hostedZone;
    this.certificate = props.certificate;
    this.originDomain = props.originDomain;
    this.targetDomain = props.targetDomain;

    const bucket = new Bucket(this, "Bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      websiteRedirect: {
        hostName: this.targetDomain,
        protocol: RedirectProtocol.HTTPS,
      },
    });

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new S3StaticWebsiteOrigin(bucket),
      },
      certificate: this.certificate,
      domainNames: [this.originDomain],
      enableIpv6: true,
      httpVersion: HttpVersion.HTTP2_AND_3,
    });

    new ARecord(this, "ARecord", {
      zone: this.hostedZone,
      recordName: `${this.originDomain}.`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new AaaaRecord(this, "AaaaRecord", {
      zone: this.hostedZone,
      recordName: `${this.originDomain}.`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
