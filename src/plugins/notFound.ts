import fs from "node:fs";
import path from "node:path";
import { FastifyInstance } from "fastify";
import { StaticSite } from "../configuration";
import { createSiteMap } from "./utils";

export function NotFoundPlugin(
  fastify: FastifyInstance<any>,
  { staticSites }: { staticSites: StaticSite[] }
) {
  if (staticSites.length > 0) {
    const siteMap = createSiteMap(staticSites);
    fastify.setNotFoundHandler((req, reply) => {
      const staticSite = siteMap[req.hostname.toLowerCase()];
      if (staticSite) {
        const { spa, root } = staticSite;
        if (spa) {
          reply.sendFile("index.html", root);
        } else {
          if (fs.existsSync(path.resolve(root, "404.html"))) {
            reply.code(404).sendFile("404.html", root);
          } else {
            reply.callNotFound();
          }
        }
      }
    });
  }
}
