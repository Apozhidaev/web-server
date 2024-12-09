import { FastifyInstance } from "fastify";
import { port, StaticSite } from "../configuration";
import { createSiteMap } from "./utils";

export function RedirectToHttpsPlugin(
  fastify: FastifyInstance<any>,
  { httpsSites }: { httpsSites: StaticSite[] }
) {
  if (httpsSites.length > 0) {
    const siteMap = createSiteMap(httpsSites);
    fastify.addHook("onRequest", (req, reply, done) => {
      const site = siteMap[req.hostname.toLowerCase()];
      if (site) {
        reply.redirect(`https://${site.host}:${port.https}${req.url}`);
      }
      done();
    });
  }
}
