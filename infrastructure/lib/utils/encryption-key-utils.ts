export class EncryptionKeyUtils {
  public static ConstructKMSKeyName(keyOf: string): string {
    return `${keyOf}-kms-key`;
  }

  public static ConstructKMSKeyAlias(keyOf: string): string {
    return `${keyOf}-kms-key-alias`;
  }
}
