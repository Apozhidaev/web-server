const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("config");
const express = require("express");
const vhost = require("vhost");

const cwd = process.cwd();
const port = config.get("port");
const sites = config.get("sites");

function redirectToUrl(app, { host, redirectTo }) {
  app.use(
    vhost(host, (req, res) => {
      return res.redirect(redirectTo);
    })
  );
}

function redirectToHttps(app, { host }) {
  app.use(
    vhost(host, (req, res) => {
      return res.redirect(
        `https://${req.headers.host}:${port.https}${req.url}`
      );
    })
  );
}

function useStatic(app, { host, folder, spa }) {
  const root = path.resolve(cwd, "sites", folder);
  app.use(vhost(host, express.static(root, { extensions: ["html"] })));
  app.use(
    vhost(host, (req, res) => {
      res.sendFile(spa ? "index.html" : "404.html", { root });
    })
  );
}

function createVirtualHost(app, { host, redirectTo, folder, spa }) {
  if (redirectTo) {
    redirectToUrl(app, { host, redirectTo });
  } else {
    useStatic(app, { host, folder, spa });
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
      redirectToHttps(app, site);
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
  const sslServer = https.createServer(
    {
      key: fs.readFileSync(path.resolve(cwd, "cert", "key.pem")),
      cert: fs.readFileSync(path.resolve(cwd, "cert", "cert.pem")),
    },
    app
  );
  sslServer.listen(port.https, () => {
    console.log("https server listening on port %d", port.https);
  });
}
