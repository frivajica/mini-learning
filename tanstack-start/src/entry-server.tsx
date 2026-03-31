/* @refresh reload */
import { createStartHandler } from "@tanstack/react-start/server";
import { getRouterManifest } from "@tanstack/react-router/server";

export default createStartHandler({
  router: {
    manifest: getRouterManifest(),
  },
});
