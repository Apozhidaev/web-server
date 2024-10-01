import express, { Express } from "express";
import vhost from "vhost";
import path from "path";

export function redirectToUrl(app: Express, host: string, redirectTo: string) {
  app.use(
    vhost(host, (req, res: any) => {
      return res.redirect(redirectTo);
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

export function useStatic(app: Express, host: string, folder: string, spa?: boolean) {
  const root = path.resolve(process.cwd(), "sites", folder);
  app.use(vhost(host, express.static(root, { extensions: ["html"] }) as any));
  app.use(
    vhost(host, (req, res: any) => {
      res.sendFile(spa ? "index.html" : "404.html", { root });
    })
  );
}