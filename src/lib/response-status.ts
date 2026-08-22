import { createIsomorphicFn } from "@tanstack/react-start";

/** Establece el status HTTP durante SSR; en el cliente es un no-op. */
export const setSsrStatus = createIsomorphicFn()
  .client((_status: number) => {})
  .server((status: number) => {
    try {
      // Import estático seguro: este archivo solo corre en servidor.
      const mod = require("@tanstack/react-start/server");
      mod.setResponseStatus(status);
    } catch {
      /* noop */
    }
  });
