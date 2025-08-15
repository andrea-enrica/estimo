export class S3Utils {
  public static ConstructLoggingBucketName(bucketName: string): string {
    return `${bucketName}-log`;
  }
}
