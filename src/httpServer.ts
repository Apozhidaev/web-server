import express from "express";
import compression from "compression";
import { createVirtualHost, redirectToHttps } from "./virtualHost";
import { port, sites } from "./settings";

if (port.http) {
  const app = express();
  app.use(compression());
  sites.forEach((site) => {
    if ("ssl" in site && site.ssl) {
      redirectToHttps(app, site.host, port.https!);
    } else {
      createVirtualHost(app, site);
    }
  });
  app.listen(port.http, () => {
    console.log("http server listening on port %d", port.http);
  });
}
