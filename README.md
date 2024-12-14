# @builtonaws/fastmail-route53-constructs

Construct to build a redirect with an S3 bucket and a CloudFront distribution.

## Usage

<details>
<summary>TypeScript</summary>

Install package:

```sh
npm install @builtonaws/s3-cloudfront-redirect
```

Use FastmailDomainVerification construct:

```typescript
import { S3CloudFrontRedirect } from "@builtonaws/s3-cloudfront-redirect";
import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as r53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export class ExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = new r53.PublicHostedZone(this, "PublicHostedZone", {
      zoneName: "example.com",
    });
    const certificate = new acm.Certificate(this, "Certificate", {
        domainName: "example.com",
        validation: acm.CertificateValidation.fromDns(hostedZone)
    })

    new S3CloudFrontRedirect(this, "S3CloudFrontRedirect", {
      hostedZone,
      certificate,
      originDomain: "example.com",
      targetDomain: "example.org",
    });
  }
}
```
</details>
