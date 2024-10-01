const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("config");
const express = require("express");
const vhost = require("vhost");

const cwd = process.cwd();

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
      return res.redirect("https://" + req.headers.host + req.url);
    })
  );
}

function virtualHost(app, { host, folder, spa }) {
  const root = path.resolve(cwd, "sites", folder);
  app.use(vhost(host, express.static(root, { extensions: ["html"] })));
  app.use(
    vhost(host, (req, res) => {
      res.sendFile(spa ? "index.html" : "404.html", { root });
    })
  );
}

console.log("sites:");

const sites = config.get("sites");

sites.forEach((site) => {
  console.log(site.ssl ? `${site.host} (ssl)` : site.host);
});

console.log("------------------------");

const port = config.get("port");

if (port.http) {
  const app = express();
  sites.forEach((site) => {
    if (site.redirectTo) {
      redirectToUrl(app, site);
    } else if (site.ssl) {
      redirectToHttps(app, site);
    } else {
      virtualHost(app, site);
    }
  });
  app.listen(port.http, () => {
    console.log("http server listening on port %d", port.http);
  });
}

if (port.https) {
  const app = express();
  sites
    .filter((x) => x.ssl)
    .forEach((site) => {
      if (site.redirectTo) {
        redirectToUrl(app, site);
      } else {
        virtualHost(app, site);
      }
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
