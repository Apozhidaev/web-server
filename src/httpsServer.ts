import fs from "node:fs";
import path from "node:path";
import http2 from "node:http2";
import express from "express";
import http2Express from "http2-express";
import { createVirtualHost } from "./virtualHost";
import { certFolder, port, sites } from "./settings";

if (port.https) {
  const app = http2Express(express);
  sites.forEach((site) => {
    createVirtualHost(app, site);
  });
  const httpsServer = http2.createSecureServer(
    {
      key: fs.readFileSync(path.resolve(certFolder, "key.pem")),
      cert: fs.readFileSync(path.resolve(certFolder, "cert.pem")),
      allowHTTP1: true,
    },
    app
  );
  httpsServer.listen(port.https, () => {
    console.log("https server listening on port %d", port.https);
  });
}
