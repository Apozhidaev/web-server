import config from "config";
import path from "path";

type PortConfig = {
  http?: number;
  https?: number;
};

export type SiteConfig = { host: string } & (
  | { folder: string; ssl?: boolean; spa?: boolean }
  | { redirectTo: string }
  | { proxyTo: string }
);

export const port = config.get<PortConfig>("port");
export const sites = config.get<SiteConfig[]>("sites");
export const certFolder = path.resolve(process.cwd(), "cert");

console.log("sites:");
sites.forEach((site) => {
  console.log(site.host);
});

console.log("------------------------");