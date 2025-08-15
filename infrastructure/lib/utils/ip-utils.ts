export class IPUtils {
  private static regions = [
    {
      ip_prefix: "3.4.12.4/32",
      region: "eu-west-1",
      service: "AMAZON",
      network_border_group: "eu-west-1",
    },
  ];

  public static getEnabledIps(): string[] {
    return this.regions.map((r) => r.ip_prefix);
  }
}
