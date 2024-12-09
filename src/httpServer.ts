import fs from "node:fs";
import path from "node:path";
import Fastify from "fastify";
import FastifyCompressPlugin from "@fastify/compress";
import FastifyStaticPlugin from "@fastify/static";
import {
  port,
  staticSiteMap,
  staticSites,
  redirectSites,
} from "./configuration";

if (port.http) {
  const fastify = Fastify({
    // logger: true,
  });

  fastify.register(FastifyCompressPlugin);

  // -------- static -----------
  let hasStatic = false;

  for (let i = 0; i < staticSites.length; i++) {
    const { host, ssl, root } = staticSites[i];
    if (ssl) {
      fastify.addHook("onRequest", (req, reply, done) => {
        if (req.hostname.toLowerCase() === host) {
          reply.redirect(`https://${host}:${port.https}${req.url}`);
        }
        done();
      });
    } else {
      fastify.register(FastifyStaticPlugin, {
        root,
        decorateReply: !hasStatic,
        constraints: { host },
      });
      hasStatic = true;
    }
  }

  fastify.setNotFoundHandler((req, reply) => {
    const staticSite = staticSiteMap[req.hostname.toLowerCase()];
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
  // ---------------------------

  // -------- redirect ---------

  for (let i = 0; i < redirectSites.length; i++) {
    const { host, redirectTo } = redirectSites[i];
    fastify.addHook("onRequest", (req, reply, done) => {
      if (req.hostname.toLowerCase() === host) {
        reply.redirect(redirectTo);
      }
      done();
    });
  }
  // ---------------------------

  fastify.listen({ port: port.http, host: '0.0.0.0' }, (err) => {
    if (err) throw err;
    console.log("http server listening on port %d", port.http);
  });
}
