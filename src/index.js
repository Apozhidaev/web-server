const fs = require("fs");
const path = require("path");
const https = require("https");
const config = require("config");
const express = require("express");
const vhost = require("vhost");

function createVirtualHost(app, { host, folder, ssl }) {
  if (ssl) {
    app.use(function (request, response, next) {
      if (!request.secure) {
        return response.redirect(
          "https://" + request.headers.host + request.url
        );
      }
      next();
    });
  }
  const root = path.resolve(__dirname, path.resolve("sites", folder));
  app.use(vhost(host, express.static(root)));
  app.use(
    vhost(host, (req, res) => {
      res.sendFile("index.html", { root });
    })
  );
}

console.log("sites:");
config.get("sites").forEach((site) => {
  console.log(site.host);
});

console.log("------------------------");

//Start server
const port = config.get("port");

if (port.http) {
  const app = express();
  config.get("sites").forEach((site) => createVirtualHost(app, site));
  app.listen(port.http, () => {
    console.log("web server listening on port %d", port.http);
  });
}

if (port.https) {
  const app = express();
  config.get("sites").forEach((site) => createVirtualHost(app, site));
  const sslServer = https.createServer(
    {
      key: fs.readFileSync(path.join(process.cwd(), "cert", "key.pem")),
      cert: fs.readFileSync(path.join(process.cwd(), "cert", "cert.pem")),
    },
    app
  );
  sslServer.listen(port.https, () => {
    console.log("ssl server listening on port %d", port.https);
  });
}
