import fs from "fs";
import path from "path";
import https from "https";
import express from "express";
import { createVirtualHost } from "./virtualHost";
import { certFolder, port, sites } from "./settings";

if (port.https) {
  const app = express();
  sites.forEach((site) => {
    createVirtualHost(app, site);
  });
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(path.resolve(certFolder, "key.pem")),
      cert: fs.readFileSync(path.resolve(certFolder, "cert.pem")),
    },
    app
  );
  httpsServer.listen(port.https, () => {
    console.log("https server listening on port %d", port.https);
  });
}
