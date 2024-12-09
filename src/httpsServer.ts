import fs from "node:fs";
import path from "node:path";
import Fastify from "fastify";
import CompressPlugin from "@fastify/compress";
import {
  port,
  httpsSites,
  redirectSites,
  certFolder,
} from "./configuration";
import { NotFoundPlugin, RedirectToUrlPlugin, UseStaticPlugin } from "./plugins";

if (port.https) {
  const fastify = Fastify({
    // logger: true,
    http2: true,
    https: {
      key: fs.readFileSync(path.resolve(certFolder, "key.pem")),
      cert: fs.readFileSync(path.resolve(certFolder, "cert.pem")),
      allowHTTP1: true,
    },
  });

  if (redirectSites.length > 0) {
    fastify.register(RedirectToUrlPlugin, { redirectSites });
  }

  if (httpsSites.length > 0) {
    fastify.register(CompressPlugin);
    fastify.register(UseStaticPlugin, { staticSites: httpsSites });
    fastify.register(NotFoundPlugin, { staticSites: httpsSites });
  }

  fastify.listen({ port: port.https, host: "0.0.0.0" }, (err) => {
    if (err) throw err;
    console.log("https server listening on port %d", port.https);
  });
}
