import path from "node:path";
import config from "config";

type PortConfig = {
  http?: number;
  https?: number;
};

export type HostConfig = { host: string };
type StaticConfig = { folder: string; ssl?: boolean; spa?: boolean };
type RedirectConfig = { redirectTo: string };
type ProxyConfig = { proxyTo: string };

export type SiteConfig = HostConfig &
  (StaticConfig | RedirectConfig | ProxyConfig);

export type StaticSite = HostConfig &
  Omit<StaticConfig, "folder"> & { root: string };
export type RedirectSite = HostConfig & RedirectConfig;
export type ProxySite = HostConfig & ProxyConfig;

export const port = config.get<PortConfig>("port");
const sites = config.get<SiteConfig[]>("sites");
export const certFolder = path.resolve(process.cwd(), "cert");

const staticSites = sites
  .filter((site) => "folder" in site)
  .map((site) => ({
    host: site.host,
    root: path.resolve(process.cwd(), "sites", site.folder),
    ssl: site.ssl,
    spa: site.spa,
  }));
export const redirectSites = sites.filter((site) => "redirectTo" in site);
export const proxySites = sites.filter((site) => "proxyTo" in site);

export const httpSites = staticSites.filter((x) => !x.ssl);
export const httpsSites = staticSites.filter((x) => x.ssl);

console.log("sites:");
sites.forEach((site) => {
  console.log(site.host);
});

console.log("------------------------");
