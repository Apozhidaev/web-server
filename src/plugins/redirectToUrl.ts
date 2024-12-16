import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { RedirectSite } from "../configuration";
import { createSiteMap } from "./utils";

export const RedirectToUrlPlugin = fp(function RedirectToUrlPlugin(
  fastify: FastifyInstance<any>,
  { redirectSites }: { redirectSites: RedirectSite[] }
) {
  if (redirectSites.length > 0) {
    const siteMap = createSiteMap(redirectSites);
    fastify.addHook("onRequest", (req, reply, done) => {
      const site = siteMap[req.hostname.toLowerCase()];
      if (site) {
        reply.redirect(site.redirectTo);
      }
      done();
    });
  }
});
