import { createServerFn } from "@tanstack/react-start";

export const getServiceStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { collectStatus } = await import("./status.server");
  return collectStatus();
});
