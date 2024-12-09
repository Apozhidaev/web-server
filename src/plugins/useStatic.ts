import { FastifyInstance } from "fastify";
import FastifyStaticPlugin from "@fastify/static";
import { StaticSite } from "../configuration";

export function UseStaticPlugin(
  fastify: FastifyInstance<any>,
  { staticSites }: { staticSites: StaticSite[] }
) {
  for (let i = 0; i < staticSites.length; i++) {
    const { host, root } = staticSites[i];
    fastify.register(FastifyStaticPlugin, {
      root,
      constraints: { host },
      decorateReply: i === 0,
    });
  }
  if (staticSites.length > 0) {
    fastify.addHook("onSend", (req, reply, payload, done) => {
      const err = null;
      if (req.url.endsWith(".png")) {
        reply.header("cache-control", "public, max-age=60");
      }
      done(err, payload);
    });
  }
}
