import fs from "node:fs";
import path from "node:path";
import express, { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import vhost from "vhost";
import { SiteConfig } from "./settings";

function proxyToUrl(app: Application, host: string, proxyTo: string) {
  app.use(
    vhost(
      host,
      createProxyMiddleware({
        target: proxyTo,
        changeOrigin: true,
      })
    )
  );
}

function redirectToUrl(app: Application, host: string, redirectTo: string) {
  app.use(
    vhost(host, (req, res: any) => {
      return res.redirect(redirectTo);
    })
  );
}

function useStatic(
  app: Application,
  host: string,
  folder: string,
  spa?: boolean
) {
  const root = path.resolve(process.cwd(), "sites", folder);
  app.use(vhost(host, express.static(root, { extensions: ["html"] }) as any));
  app.use(
    vhost(host, (req, res: any) => {
      if (spa) {
        res.sendFile("index.html", { root });
      } else {
        if (fs.existsSync(path.resolve(root, "404.html"))) {
          res.sendFile("404.html", { root });
        } else {
          res.sendStatus(404);
        }
      }
    })
  );
}

export function redirectToHttps(app: Application, host: string, port: number) {
  app.use(
    vhost(host, (req, res: any) => {
      return res.redirect(`https://${host}:${port}${req.url}`);
    })
  );
}

export function createVirtualHost(app: Application, site: SiteConfig) {
  if ("redirectTo" in site) {
    redirectToUrl(app, site.host, site.redirectTo);
  } else if ("proxyTo" in site) {
    proxyToUrl(app, site.host, site.proxyTo);
  } else {
    useStatic(app, site.host, site.folder, site.spa);
  }
}
