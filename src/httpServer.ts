import Fastify from "fastify";
import CompressPlugin from "@fastify/compress";
import {
  port,
  redirectSites,
  httpSites,
  httpsSites,
} from "./configuration";
import {
  NotFoundPlugin,
  RedirectToHttpsPlugin,
  RedirectToUrlPlugin,
  UseStaticPlugin,
} from "./plugins";

if (port.http) {
  const fastify = Fastify({
    // logger: true,
  });

  if (redirectSites.length > 0) {
    fastify.register(RedirectToUrlPlugin, { redirectSites });
  }

  if (httpsSites.length > 0) {
    fastify.register(RedirectToHttpsPlugin, { httpsSites });
  }

  if (httpSites.length > 0) {
    fastify.register(CompressPlugin);
    fastify.register(UseStaticPlugin, { staticSites: httpSites });
    fastify.register(NotFoundPlugin, { staticSites: httpSites });
  }

  fastify.listen({ port: port.http, host: "0.0.0.0" }, (err) => {
    if (err) throw err;
    console.log("http server listening on port %d", port.http);
  });
}
