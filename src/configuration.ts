import path from "node:path";
import config from "config";

type PortConfig = {
  http?: number;
  https?: number;
};

type HostConfig = { host: string };
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
export const sites = config.get<SiteConfig[]>("sites");
export const certFolder = path.resolve(process.cwd(), "cert");

export const staticSites = sites
  .filter((site) => "folder" in site)
  .map((site) => ({
    host: site.host,
    root: path.resolve(process.cwd(), "sites", site.folder),
    ssl: site.ssl,
    spa: site.spa,
  }));
export const redirectSites = sites.filter((site) => "redirectTo" in site);
export const proxySites = sites.filter((site) => "proxyTo" in site);

export const staticSiteMap = staticSites.reduce((acc, cur) => {
  acc[cur.host] = cur;
  return acc;
}, {} as Record<string, StaticSite>);

console.log("sites:");
sites.forEach((site) => {
  console.log(site.host);
});

console.log("------------------------");
