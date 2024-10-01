import express, { Express } from "express";
import config from "config";
import https from "https";
import path from "path";
import fs from "fs";
import { redirectToHttps, redirectToUrl, useStatic } from "./utils";

type PortConfig = {
  http?: number;
  https?: number;
};

type SiteConfig = {
  host: string;
  ssl?: boolean;
  spa?: boolean;
} & ({ redirectTo: string } | { folder: string });

const port = config.get<PortConfig>("port");
const sites = config.get<SiteConfig[]>("sites");
const certFolder = path.resolve(process.cwd(), "cert");

function createVirtualHost(app: Express, site: SiteConfig) {
  if ("redirectTo" in site) {
    redirectToUrl(app, site.host, site.redirectTo);
  } else {
    useStatic(app, site.host, site.folder, site.spa);
  }
}

console.log("sites:");
sites.forEach((site) => {
  console.log(site.ssl ? `${site.host} (ssl)` : site.host);
});

console.log("------------------------");

if (port.http) {
  const app = express();
  sites.forEach((site) => {
    if (site.ssl) {
      redirectToHttps(app, site.host, port.https!);
    } else {
      createVirtualHost(app, site);
    }
  });
  app.listen(port.http, () => {
    console.log("http server listening on port %d", port.http);
  });
}

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
