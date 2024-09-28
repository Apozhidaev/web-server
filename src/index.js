const config = require("config");
const express = require("express");
const vhost = require("vhost");
const https = require("https");
const path = require("path");

function createVirtualHost({ host, folder }) {
  console.log(host);
  const root = path.resolve(__dirname, path.resolve("sites", folder));
  app.use(vhost(host, express.static(root)));
  app.use(
    vhost(host, (req, res) => {
      res.sendFile("index.html", { root });
    })
  );
}

//Create server
var app = express();
console.log("sites:");
config.get("sites").forEach((site) => createVirtualHost(site));

console.log("------------------------");

//Start server
var port = config.get("port");

if (config.get("ssl")) {
  const sslServer = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    },
    app
  );
  sslServer.listen(port, () => {
    console.log("ssl server listening on port %d", port);
  });
} else {
  app.listen(port, () => {
    console.log("web server listening on port %d", port);
  });
}
