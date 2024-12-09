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
}
