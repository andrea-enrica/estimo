import { adminApi } from "../api/AdminApi";
import { sessionApi } from "../api/SessionApi";

type LazyQueryReturnType<
  Api extends { endpoints: Record<string, any> },
  EndpointName extends keyof Api["endpoints"]
> = ReturnType<Api["endpoints"][EndpointName]["useLazyQuery"]>[0];

export type LazyQueryUsersTrigger = LazyQueryReturnType<
  typeof adminApi,
  "getUsersPaged"
>;
export type LazyQuerySessionTrigger = LazyQueryReturnType<
  typeof sessionApi,
  "getSessionsPaged"
>;
