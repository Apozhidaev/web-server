import express, { Express } from "express";
import vhost from "vhost";
import path from "path";
import { SiteConfig } from "./settings";

function redirectToUrl(app: Express, host: string, redirectTo: string) {
  app.use(
    vhost(host, (req, res: any) => {
      return res.redirect(redirectTo);
    })
  );
}

function useStatic(app: Express, host: string, folder: string, spa?: boolean) {
  const root = path.resolve(process.cwd(), "sites", folder);
  app.use(vhost(host, express.static(root, { extensions: ["html"] }) as any));
  app.use(
    vhost(host, (req, res: any) => {
      res.sendFile(spa ? "index.html" : "404.html", { root });
    })
  );
}

export function redirectToHttps(app: Express, host: string, port: number) {
  app.use(
    vhost(host, (req, res: any) => {
      return res.redirect(`https://${host}:${port}${req.url}`);
    })
  );
}

export function createVirtualHost(app: Express, site: SiteConfig) {
  if ("redirectTo" in site) {
    redirectToUrl(app, site.host, site.redirectTo);
  } else {
    useStatic(app, site.host, site.folder, site.spa);
  }
}